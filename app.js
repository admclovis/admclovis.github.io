function decodeAsset(value){const binary=atob(value);return Uint8Array.from(binary,c=>c.charCodeAt(0));}
const form=document.querySelector('#form'),status=document.querySelector('#status'),button=document.querySelector('#download');
const now=new Date();form.elements.data.value=[now.getFullYear(),String(now.getMonth()+1).padStart(2,'0'),String(now.getDate()).padStart(2,'0')].join('-');
function formatCityIdentity(value){
 const match=String(value).trim().match(/^(\d+)\s*[|•:–—-]?\s*(\p{L}[\p{L}\p{M}\s.'’\-]*)$/u);
 if(!match)throw new Error('No campo ID e nome na cidade, informe primeiro o ID numérico e depois o nome. Ex.: 12345 | Clóvis Silva');
 return match[1]+' | '+match[2].trim().replace(/\s+/g,' ');
}
async function makePdf(v){
if(typeof PDFLib==='undefined')throw new Error('O gerador ainda está carregando. Atualize a página e tente novamente.');
const {PDFDocument,PDFName,PDFString,rgb}=PDFLib;
const doc=await PDFDocument.load(decodeAsset(LOTUS_ASSETS.pdf));doc.registerFontkit(fontkit);const font=await doc.embedFont(decodeAsset(LOTUS_ASSETS.arial),{subset:true});const pages=doc.getPages();for(const page of pages){page.node.wrapContentStreams(doc.context.register(doc.context.flateStream("q\n")),doc.context.register(doc.context.flateStream("\nQ")));}
function write(pi,value,x,top,maxWidth,size=16){const text=String(value).trim();let fs=size;while(font.widthOfTextAtSize(text,fs)>maxWidth&&fs>6)fs-=.25;if(font.widthOfTextAtSize(text,fs)>maxWidth)throw new Error('Um dos nomes é muito longo. Reduza o texto e tente novamente.');pages[pi].drawText(text,{x,y:842-top,size:fs,font,color:rgb(0,0,0)});}
write(0,v.nome,108,252,235);write(0,formatCityIdentity(v.cidade),171,274,260);write(0,v.email,77,295,195,16);write(1,v.assinatura,190,487,193,16);
const cargos=['Ajudante','Suporte','Moderador','Administrador'];const index=cargos.indexOf(v.cargo);if(index<0)throw new Error('Selecione um cargo.');write(1,'X',93,573+index*22.1504,11,12);
write(0,'X',93,593,11,12);
const [ano,mes,dia]=v.data.split('-');write(1,dia,405,707,25,16);write(1,'/',432,707,10,16);write(1,mes,448,707,25,16);write(1,'/',475,707,10,16);write(1,ano.slice(-2),491,707,25,16);
const rulesLink=doc.context.register(doc.context.obj({Type:'Annot',Subtype:'Link',Rect:[72,308,333,328],Border:[0,0,0],A:{Type:'Action',S:'URI',URI:PDFString.of('https://www.regraslotusgroup.com.br')}}));pages[0].node.addAnnot(rulesLink);
doc.setTitle('Termo de responsabilidade - Lotus Group');doc.setAuthor('Lotus Group');return doc.save();
}
let currentPdfUrl=null;
const result=document.querySelector('#result'),saveLink=document.querySelector('#save-pdf'),openLink=document.querySelector('#open-pdf');
form.addEventListener('input',()=>{result.hidden=true;status.textContent='Após preencher, gere seu termo para baixar.';});
form.addEventListener('submit',async event=>{
 event.preventDefault();if(!form.reportValidity())return;
 button.disabled=true;result.hidden=true;status.textContent='Preparando seu PDF…';
 try{
 const values=Object.fromEntries(new FormData(form));
 for(const key of ['nome','cidade','email','assinatura'])if(!values[key].trim())throw new Error('Preencha todos os campos.');
 const bytes=await makePdf(values);
 if(currentPdfUrl)URL.revokeObjectURL(currentPdfUrl);
 currentPdfUrl=URL.createObjectURL(new Blob([bytes],{type:'application/pdf'}));
 saveLink.href=currentPdfUrl;saveLink.download='Termo_STAFF_'+values.nome.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9]+/g,'_')+'.pdf';
 openLink.href=currentPdfUrl;result.hidden=false;
 status.textContent='Termo gerado. Clique em “Baixar PDF preenchido” acima para salvar.';
 }catch(error){status.textContent=error.message.includes('WinAnsi')?'Use letras, números e acentos comuns nos campos, sem emojis.':error.name==='TimeoutError'?'O modelo demorou para carregar. Tente novamente.':error.message||'Não foi possível gerar o PDF. Tente novamente.';}
 finally{button.disabled=false;}
});
