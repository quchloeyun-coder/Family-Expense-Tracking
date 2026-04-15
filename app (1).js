// app.js v5.0 - Pure JS, no Babel required
var h=React.createElement,us=React.useState,ue=React.useEffect,uc=React.useCallback;
var CATS_P1=[{id:"food",name:"餐饮",icon:"🍜",color:"#FF6B6B"},{id:"transport",name:"交通",icon:"🚗",color:"#4ECDC4"},{id:"shopping",name:"购物",icon:"🛍️",color:"#45B7D1"},{id:"daily",name:"日用",icon:"🧴",color:"#FFB7B2"},{id:"medical",name:"医疗",icon:"💊",color:"#DDA0DD"},{id:"clothing",name:"服饰",icon:"👔",color:"#F7DC6F"},{id:"beauty",name:"美容",icon:"💄",color:"#FF69B4"},{id:"pet",name:"宠物",icon:"🐱",color:"#C9B1FF"}];
var CATS_P2=[{id:"entertainment",name:"娱乐",icon:"🎮",color:"#D4A574"},{id:"education",name:"学习",icon:"📚",color:"#98D8C8"},{id:"social",name:"社交",icon:"🍻",color:"#E8A87C"},{id:"phone",name:"通讯",icon:"📱",color:"#85CDCA"},{id:"housing",name:"住房",icon:"🏠",color:"#96CEB4"},{id:"sport",name:"运动",icon:"🏃",color:"#FF9AA2"},{id:"travel",name:"旅行",icon:"✈️",color:"#B5EAD7"},{id:"other",name:"其他",icon:"📝",color:"#C7CEEA"}];
var CATS=[].concat(CATS_P1,CATS_P2);
var DEF_CURR=[{code:"HKD",name:"港币",symbol:"HK$",rate:1},{code:"CNY",name:"人民币",symbol:"¥",rate:1.15},{code:"USD",name:"美元",symbol:"$",rate:7.83},{code:"EUR",name:"欧元",symbol:"€",rate:9.05}];
var MEMBERS=[{id:"wife",name:"老婆",avatar:"👩",color:"#FF69B4"},{id:"husband",name:"老公",avatar:"👨",color:"#4A90D9"}];
var WD=["周日","周一","周二","周三","周四","周五","周六"];
function fmtD(d){return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")}
function mStr(d){return d.getFullYear()+"年"+(d.getMonth()+1)+"月"}
function yStr(d){return d.getFullYear()+"年"}
function sameM(a,b){var x=new Date(a),y=new Date(b);return x.getFullYear()===y.getFullYear()&&x.getMonth()===y.getMonth()}
function sameY(a,b){return new Date(a).getFullYear()===new Date(b).getFullYear()}
function fCur(c,l){return l.find(function(x){return x.code===c})||l[0]}
function fMem(id){return MEMBERS.find(function(m){return m.id===id})||MEMBERS[0]}
function newId(){return Date.now().toString(36)+Math.random().toString(36).slice(2,8)}
function fmtN(n,d){if(d===undefined)d=2;var p=n.toFixed(d).split('.');p[0]=p[0].replace(/\B(?=(\d{3})+(?!\d))/g,',');return p.join('.')}
function fmtInt(n){return Math.round(n).toLocaleString()}
function fmtV(v){if(v>=1000000)return(v/1000000).toFixed(1)+"m";if(v>=1000)return Math.round(v/1000)+"k";return v.toFixed(0)}

// === Subcomponents using h() ===

function PieChart(props){
  var data=props.data,size=props.size||260;
  if(!data||!data.length)return h('div',{style:{textAlign:"center",color:"#999",padding:20}},"暂无数据");
  var total=data.reduce(function(s,d){return s+d.value},0);
  if(!total)return h('div',{style:{textAlign:"center",color:"#999",padding:20}},"暂无数据");
  var r=55,cx=size/2,cy=size/2,cum=-Math.PI/2;
  var slices=data.map(function(d){var ang=(d.value/total)*2*Math.PI,sa=cum;cum+=ang;return{name:d.name,value:d.value,color:d.color,sa:sa,ea:cum,mid:sa+ang/2,ang:ang,pct:d.value/total*100}});
  var paths=slices.map(function(d,i){var la=d.ang>Math.PI?1:0;var x1=cx+r*Math.cos(d.sa),y1=cy+r*Math.sin(d.sa),x2=cx+r*Math.cos(d.ea),y2=cy+r*Math.sin(d.ea);var p=data.length===1?"M "+cx+" "+(cy-r)+" A "+r+" "+r+" 0 1 1 "+(cx-.01)+" "+(cy-r)+" Z":"M "+cx+" "+cy+" L "+x1+" "+y1+" A "+r+" "+r+" 0 "+la+" 1 "+x2+" "+y2+" Z";return h('path',{key:i,d:p,fill:d.color,stroke:"#fff",strokeWidth:"2"})});
  var labels=slices.filter(function(d){return d.pct>=3}).map(function(d,i){var lr1=r+10,lr2=r+28,lr3=r+42;var mx=cx+lr1*Math.cos(d.mid),my=cy+lr1*Math.sin(d.mid);var ex=cx+lr2*Math.cos(d.mid),ey=cy+lr2*Math.sin(d.mid);var isR=d.mid>-Math.PI/2&&d.mid<Math.PI/2;var tx=cx+lr3*Math.cos(d.mid);return h('g',{key:'l'+i},h('line',{x1:mx,y1:my,x2:ex,y2:ey,stroke:d.color,strokeWidth:"1.2",opacity:"0.5"}),h('text',{x:tx,y:ey+4,fontSize:"9",fill:"#555",textAnchor:isR?"start":"end"},d.name+" "+d.pct.toFixed(0)+"%"))});
  return h('div',{style:{display:"flex",justifyContent:"center",overflow:"visible"}},h('svg',{width:size,height:size,style:{overflow:"visible"}},paths,labels));
}

function LineChart(props){
  var data=props.data,height=props.height||150;
  if(!data||!data.length)return null;
  var max=Math.max.apply(null,data.map(function(d){return d.value}).concat([1]));
  var n=data.length,padL=8,padR=8,padT=24,padB=22,vw=n*28+padL+padR,ch=height-padT-padB;
  var pts=data.map(function(d,i){var x=padL+i*((vw-padL-padR)/(n-1||1));var y=padT+ch-(d.value/max)*ch;return{x:x,y:y,value:d.value,label:d.label}});
  var line=pts.map(function(p,i){return(i===0?"M":"L")+p.x.toFixed(1)+" "+p.y.toFixed(1)}).join(" ");
  var area=line+" L"+pts[n-1].x.toFixed(1)+" "+(padT+ch)+" L"+pts[0].x.toFixed(1)+" "+(padT+ch)+" Z";
  var els=[h('defs',{key:'d'},h('linearGradient',{id:"lfg",x1:"0",y1:"0",x2:"0",y2:"1"},h('stop',{offset:"0%",stopColor:"#667eea",stopOpacity:"0.15"}),h('stop',{offset:"100%",stopColor:"#667eea",stopOpacity:"0"}))),h('path',{key:'a',d:area,fill:"url(#lfg)"}),h('path',{key:'l',d:line,fill:"none",stroke:"#667eea",strokeWidth:"2",strokeLinejoin:"round"})];
  pts.forEach(function(p,i){els.push(h('g',{key:'p'+i},h('circle',{cx:p.x,cy:p.y,r:"3",fill:"#667eea",stroke:"#fff",strokeWidth:"1.5"}),h('text',{x:p.x,y:p.y-8,fontSize:"8",fill:"#888",textAnchor:"middle"},fmtV(p.value)),h('text',{x:p.x,y:padT+ch+14,fontSize:"8",fill:"#aaa",textAnchor:"middle"},p.label)))});
  return h('svg',{width:"100%",height:height,viewBox:"0 0 "+vw+" "+height,preserveAspectRatio:"none",style:{display:"block"}},els);
}

function NumPad(props){
  var value=props.value,onCh=props.onCh,onDel=props.onDel;
  var _p=us(null),pressed=_p[0],setP=_p[1];
  var keys=["1","2","3","4","5","6","7","8","9",".","0","⌫"];
  function tap(k){setP(k);setTimeout(function(){setP(null)},120);if(k==="⌫")onDel();else if(k==="."){if(!value.includes("."))onCh(value+".")}else{var p=value.split(".");if(p[1]&&p[1].length>=2)return;onCh(value==="0"?k:value+k)}}
  return h('div',{style:{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:3,padding:"0 2px"}},keys.map(function(k){return h('button',{key:k,onClick:function(){tap(k)},style:{height:34,border:"none",borderRadius:8,fontSize:17,fontWeight:500,background:k==="⌫"?(pressed===k?"#fbb":"#ffe0e0"):(pressed===k?"#d5d7e0":"#f5f5f5"),color:k==="⌫"?"#e74c3c":"#333",cursor:"pointer",transition:"background .1s",transform:pressed===k?"scale(0.95)":"scale(1)"}},k)}));
}

function CatPicker(props){
  var selCat=props.selCat,onSelect=props.onSelect;
  var _pr=us(null),pr=_pr[0],setPr=_pr[1];
  return h('div',{style:{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:4}},CATS.map(function(c){var s=selCat&&selCat.id===c.id;var p=pr===c.id;return h('button',{key:c.id,onClick:function(){setPr(c.id);setTimeout(function(){setPr(null)},150);onSelect(c)},style:{display:"flex",flexDirection:"column",alignItems:"center",padding:"6px 2px",border:s?"2px solid "+c.color:"2px solid transparent",borderRadius:10,background:s?c.color+"15":p?"#eee":"#fafafa",cursor:"pointer",transition:"all .1s",transform:p?"scale(0.93)":"scale(1)"}},h('span',{style:{fontSize:20}},c.icon),h('span',{style:{fontSize:9,marginTop:1,color:"#555"}},c.name))}));
}

function DateModal(props){
  var val=props.value,onPick=props.onPick,onClose=props.onClose;
  var d=new Date(val);
  var _y=us(d.getFullYear()),yr=_y[0],setYr=_y[1];
  var _m=us(d.getMonth()),mo=_m[0],setMo=_m[1];
  var dim=new Date(yr,mo+1,0).getDate();var fd=new Date(yr,mo,1).getDay();
  var cells=[];for(var i=0;i<fd;i++)cells.push(null);for(var j=1;j<=dim;j++)cells.push(j);
  return h('div',{style:{position:"fixed",inset:0,background:"rgba(0,0,0,.4)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000},onClick:onClose},h('div',{style:{background:"#fff",borderRadius:16,padding:20,width:320,maxWidth:"90vw"},onClick:function(e){e.stopPropagation()}},h('div',{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}},h('button',{onClick:function(){if(mo===0){setYr(yr-1);setMo(11)}else setMo(mo-1)},style:{border:"none",background:"none",fontSize:20,cursor:"pointer"}},"‹"),h('span',{style:{fontWeight:600}},yr+"年"+(mo+1)+"月"),h('button',{onClick:function(){if(mo===11){setYr(yr+1);setMo(0)}else setMo(mo+1)},style:{border:"none",background:"none",fontSize:20,cursor:"pointer"}},"›")),h('div',{style:{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2,textAlign:"center"}},["日","一","二","三","四","五","六"].map(function(w){return h('div',{key:w,style:{fontSize:12,color:"#999",padding:4}},w)}),cells.map(function(dd,idx){var isSel=dd===d.getDate()&&mo===d.getMonth()&&yr===d.getFullYear();return h('div',{key:idx,onClick:function(){if(dd){onPick(fmtD(new Date(yr,mo,dd)));onClose()}},style:{padding:6,borderRadius:8,fontSize:14,cursor:dd?"pointer":"default",background:isSel?"linear-gradient(135deg,#667eea,#764ba2)":"transparent",color:isSel?"#fff":dd?"#333":"transparent",fontWeight:isSel?600:400}},dd||"")}))));
}

// Edit panel for records
function EditPanel(props){
  var rec=props.record,onSave=props.onSave,onClose=props.onClose,currencies=props.currencies;
  var _cat=us(CATS.find(function(c){return c.id===rec.category})||CATS[0]),cat=_cat[0],setCat=_cat[1];
  var _amt=us(String(rec.amount)),amt=_amt[0],setAmt=_amt[1];
  var _note=us(rec.note||""),note=_note[0],setNote=_note[1];
  var _date=us(rec.date),date=_date[0],setDate=_date[1];
  var _cur=us(rec.currency||"HKD"),cur=_cur[0],setCur=_cur[1];
  var _showDP=us(false),showDP=_showDP[0],setSDP=_showDP[1];
  var _mode=us("amount"),mode=_mode[0],setMode=_mode[1]; // "amount" or "category"
  var curr=fCur(cur,currencies);
  function doSave(){var a=parseFloat(amt);if(!a||a<=0)return;onSave({category:cat.id,categoryName:cat.name,categoryIcon:cat.icon,categoryColor:cat.color,amount:a,currency:cur,hkdAmount:a*curr.rate,note:note,date:date});onClose()}
  var overlay={position:"fixed",inset:0,background:"rgba(0,0,0,.3)",zIndex:900,display:"flex",flexDirection:"column",justifyContent:"flex-end"};
  var panel={background:"#fff",borderRadius:"20px 20px 0 0",padding:"16px 16px calc(env(safe-area-inset-bottom,0px) + 12px)",maxHeight:"70vh",overflow:"auto"};
  var tabBtn=function(id,label){return h('button',{key:id,onClick:function(){setMode(id)},style:{flex:1,padding:"8px 0",border:"none",borderRadius:10,fontSize:13,fontWeight:mode===id?600:400,background:mode===id?"#667eea":"#f0f0f0",color:mode===id?"#fff":"#666",cursor:"pointer"}},label)};

  return h('div',{style:overlay,onClick:onClose},
    showDP?h(DateModal,{value:date,onPick:function(v){setDate(v)},onClose:function(){setSDP(false)}}):null,
    h('div',{style:panel,onClick:function(e){e.stopPropagation()}},
      h('div',{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}},
        h('span',{style:{fontSize:15,fontWeight:600,color:"#333"}},"编辑记录"),
        h('button',{onClick:onClose,style:{border:"none",background:"none",fontSize:18,color:"#999",cursor:"pointer"}},"✕")),
      h('div',{style:{display:"flex",gap:8,marginBottom:12}},tabBtn("amount","金额/日期"),tabBtn("category","分类/备注")),
      mode==="amount"?h('div',null,
        h('div',{style:{textAlign:"center",fontSize:26,fontWeight:700,color:"#333",margin:"8px 0"}},curr.symbol+" "+amt),
        h('div',{style:{display:"flex",gap:5,justifyContent:"center",marginBottom:8}},currencies.map(function(c){var s=cur===c.code;return h('button',{key:c.code,onClick:function(){setCur(c.code)},style:{padding:"4px 12px",border:s?"2px solid #667eea":"2px solid #e8e8e8",borderRadius:20,fontSize:12,fontWeight:s?700:400,background:s?"rgba(102,126,234,.08)":"#fff",color:s?"#667eea":"#666",cursor:"pointer"}},c.symbol)})),
        h('div',{style:{display:"flex",gap:8,marginBottom:8}},
          h('button',{onClick:function(){setSDP(true)},style:{flex:1,padding:"7px 10px",border:"1px solid #eee",borderRadius:10,background:"#fafafa",cursor:"pointer",fontSize:12,color:"#555",textAlign:"left"}},"📅 "+date+" "+WD[new Date(date).getDay()])),
        h(NumPad,{value:amt,onCh:function(v){setAmt(v)},onDel:function(){setAmt(function(p){return p.length<=1?"0":p.slice(0,-1)})}})
      ):h('div',null,
        h('div',{style:{marginBottom:10}},h(CatPicker,{selCat:cat,onSelect:function(c){setCat(c)}})),
        h('input',{value:note,onChange:function(e){setNote(e.target.value)},placeholder:"备注",style:{width:"100%",padding:"10px 12px",border:"1px solid #eee",borderRadius:10,fontSize:13,outline:"none",marginTop:8,boxSizing:"border-box"}})),
      h('button',{onClick:doSave,style:{width:"100%",padding:13,marginTop:10,border:"none",borderRadius:12,fontSize:15,fontWeight:700,background:"linear-gradient(135deg,#667eea,#764ba2)",color:"#fff",cursor:"pointer"}},"保存修改 ✓")));
}

function CurrModal(props){
  var currs=props.currs,onSave=props.onSave,onClose=props.onClose;
  var _l=us(currs.map(function(c){return Object.assign({},c)})),list=_l[0],setL=_l[1];
  var _ei=us(-1),ei=_ei[0],sEi=_ei[1];var _er=us(""),er=_er[0],sEr=_er[1];
  var _nc=us(""),nc=_nc[0],sNc=_nc[1];var _nn=us(""),nn=_nn[0],sNn=_nn[1];var _ns=us(""),ns=_ns[0],sNs=_ns[1];var _nr=us(""),nr=_nr[0],sNr=_nr[1];
  var items=list.map(function(c,idx){
    var content;
    if(c.code==="HKD")content=h('span',{style:{fontSize:13,color:"#888"}},"基准");
    else if(ei===idx)content=h('div',{style:{display:"flex",gap:4,alignItems:"center"}},h('input',{value:er,onChange:function(e){sEr(e.target.value)},style:{width:55,padding:"3px 6px",border:"1px solid #ddd",borderRadius:6,fontSize:12,textAlign:"center",outline:"none"}}),h('button',{onClick:function(){var r=parseFloat(er);if(!isNaN(r)&&r>0){setL(list.map(function(c2,i2){return i2===idx?Object.assign({},c2,{rate:r}):c2}));sEi(-1)}},style:{border:"none",background:"#667eea",color:"#fff",borderRadius:6,padding:"3px 8px",fontSize:12,cursor:"pointer"}},"✓"));
    else content=h('div',{style:{display:"flex",gap:6,alignItems:"center"}},h('span',{style:{fontSize:12,color:"#555"}},c.rate+"HKD"),h('button',{onClick:function(){sEi(idx);sEr(String(c.rate))},style:{border:"none",background:"#f0f0f0",borderRadius:6,padding:"3px 8px",fontSize:11,cursor:"pointer",color:"#667eea"}},"编辑"),h('button',{onClick:function(){setL(list.filter(function(_,i){return i!==idx}))},style:{border:"none",background:"#fff0f0",borderRadius:6,padding:"3px 8px",fontSize:11,cursor:"pointer",color:"#e74c3c"}},"删除"));
    return h('div',{key:c.code+idx,style:{display:"flex",alignItems:"center",gap:8,padding:"8px 0",borderBottom:"1px solid #f0f0f0"}},h('div',{style:{flex:1}},h('span',{style:{fontWeight:600,fontSize:14}},c.symbol+" "+c.name)," ",h('span',{style:{color:"#999",fontSize:12}},c.code)),content)});
  return h('div',{style:{position:"fixed",inset:0,background:"rgba(0,0,0,.4)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000},onClick:onClose},h('div',{style:{background:"#fff",borderRadius:16,padding:20,width:360,maxWidth:"92vw",maxHeight:"80vh",overflow:"auto"},onClick:function(e){e.stopPropagation()}},h('div',{style:{fontSize:16,fontWeight:700,marginBottom:16,color:"#333"}},"货币管理"),items,h('div',{style:{display:"flex",gap:8,marginTop:16}},h('button',{onClick:function(){onSave(list);onClose()},style:{flex:1,padding:12,border:"none",borderRadius:10,background:"linear-gradient(135deg,#667eea,#764ba2)",color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer"}},"保存"),h('button',{onClick:onClose,style:{flex:1,padding:12,border:"1px solid #ddd",borderRadius:10,background:"#fff",color:"#888",fontSize:14,cursor:"pointer"}},"取消"))));
}

function PairingScreen(props){
  var onCreate=props.onCreate,onJoin=props.onJoin;
  var _md=us(null),mode=_md[0],setMode=_md[1];
  var _code=us(''),code=_code[0],setCode=_code[1];
  var _cc=us(''),cc=_cc[0],setCC=_cc[1];
  var _busy=us(false),busy=_busy[0],setBusy=_busy[1];
  var _err=us(''),err=_err[0],setErr=_err[1];
  var _role=us(null),role=_role[0],setRole=_role[1];
  var RS=h('div',{style:{display:'flex',gap:10,justifyContent:'center',marginBottom:16}},MEMBERS.map(function(m){var s=role===m.id;return h('button',{key:m.id,onClick:function(){setRole(m.id)},style:{padding:'12px 24px',border:s?'2px solid '+m.color:'2px solid #eee',borderRadius:12,background:s?m.color+'15':'#fff',cursor:'pointer',fontSize:16,transform:s?'scale(1.05)':'scale(1)'}},m.avatar+' '+m.name)}));
  var content;
  if(mode===null)content=h('div',{style:{display:'flex',flexDirection:'column',gap:10}},h('button',{onClick:function(){setMode('create')},style:{padding:14,border:'none',borderRadius:12,background:'linear-gradient(135deg,#667eea,#764ba2)',color:'#fff',fontSize:15,fontWeight:600,cursor:'pointer'}},"🆕 创建新家庭"),h('button',{onClick:function(){setMode('join')},style:{padding:14,border:'2px solid #667eea',borderRadius:12,background:'#fff',color:'#667eea',fontSize:15,fontWeight:600,cursor:'pointer'}},"🔗 加入已有家庭"));
  else if(mode==='create'&&!cc)content=h('div',null,h('div',{style:{fontSize:13,color:'#666',marginBottom:12}},"你是谁？"),RS,h('button',{onClick:function(){if(!role){setErr('请先选择角色');return}setBusy(true);setErr('');onCreate(role).then(function(c){setCC(c);setBusy(false)}).catch(function(e){setErr(e.message);setBusy(false)})},disabled:busy,style:{width:'100%',padding:14,border:'none',borderRadius:12,background:busy?'#ccc':'linear-gradient(135deg,#667eea,#764ba2)',color:'#fff',fontSize:15,fontWeight:600}},busy?'创建中...':'生成配对码'),err?h('div',{style:{color:'#e74c3c',fontSize:12,marginTop:8}},err):null,h('button',{onClick:function(){setMode(null);setErr('')},style:{marginTop:8,border:'none',background:'none',color:'#999',fontSize:13,cursor:'pointer'}},"返回"));
  else if(mode==='create'&&cc)content=h('div',null,h('div',{style:{fontSize:13,color:'#666',marginBottom:12}},"配对码（告诉家人）"),h('div',{style:{fontSize:36,fontWeight:700,letterSpacing:6,color:'#667eea',padding:'16px 0',background:'#f5f3ff',borderRadius:12,fontFamily:'monospace'}},cc),h('button',{onClick:function(){window.location.reload()},style:{width:'100%',marginTop:16,padding:14,border:'none',borderRadius:12,background:'linear-gradient(135deg,#667eea,#764ba2)',color:'#fff',fontSize:15,fontWeight:600}},"开始记账"));
  else if(mode==='join')content=h('div',null,h('div',{style:{fontSize:13,color:'#666',marginBottom:12}},"你是谁？"),RS,h('input',{value:code,onChange:function(e){setCode(e.target.value.toUpperCase().slice(0,6))},placeholder:"输入6位配对码",maxLength:6,style:{width:'100%',padding:14,border:'2px solid #e0e0e0',borderRadius:12,fontSize:22,textAlign:'center',letterSpacing:6,fontFamily:'monospace',outline:'none',boxSizing:'border-box',marginTop:8}}),err?h('div',{style:{color:'#e74c3c',fontSize:12,marginTop:8}},err):null,h('button',{onClick:function(){if(code.length!==6){setErr('请输入6位码');return}if(!role){setErr('请先选择角色');return}setBusy(true);setErr('');onJoin(code.toUpperCase(),role).catch(function(e){setErr(e.message);setBusy(false)})},disabled:busy,style:{width:'100%',marginTop:12,padding:14,border:'none',borderRadius:12,background:busy?'#ccc':'linear-gradient(135deg,#667eea,#764ba2)',color:'#fff',fontSize:15,fontWeight:600}},busy?'加入中...':'加入家庭'),h('button',{onClick:function(){setMode(null);setErr('');setCode('')},style:{marginTop:8,border:'none',background:'none',color:'#999',fontSize:13,cursor:'pointer'}},"返回"));
  return h('div',{style:{minHeight:'100vh',background:'linear-gradient(135deg,#667eea,#764ba2)',display:'flex',alignItems:'center',justifyContent:'center',padding:20}},h('div',{style:{background:'#fff',borderRadius:20,padding:28,width:'100%',maxWidth:360,textAlign:'center'}},h('div',{style:{fontSize:56,marginBottom:8}},"👨‍👩‍👧‍👦"),h('div',{style:{fontSize:20,fontWeight:700,color:'#333'}},"家庭共享记账"),h('div',{style:{fontSize:13,color:'#888',marginTop:6,marginBottom:24}},"请创建或加入家庭"),content));
}

// Category detail page
function CatDetail(props){
  var cat=props.cat,records=props.records,viewMonth=props.viewMonth,statMode=props.statMode,onBack=props.onBack,onEdit=props.onEdit,currencies=props.currencies;
  var _dm=us(statMode),dm=_dm[0],setDm=_dm[1];
  var _vm=us(viewMonth),vm=_vm[0],setVm=_vm[1];
  var _editRec=us(null),editRec=_editRec[0],setEditRec=_editRec[1];
  var isY=dm==="year";
  var recs=records.filter(function(r){return r.category===cat.id&&(isY?sameY(r.date,vm):sameM(r.date,vm))});
  var total=recs.reduce(function(s,r){return s+(r.hkdAmount||r.amount)},0);
  var sorted=recs.slice().sort(function(a,b){return(b.hkdAmount||b.amount)-(a.hkdAmount||a.amount)});
  var lineData=[];
  if(isY){for(var i=0;i<12;i++){var d=new Date(vm.getFullYear(),i,1);lineData.push({label:(i+1)+"月",value:records.filter(function(r){return r.category===cat.id&&sameM(r.date,d)}).reduce(function(s,r){return s+(r.hkdAmount||r.amount)},0)})}}
  else{for(var i=11;i>=0;i--){var d=new Date(vm.getFullYear(),vm.getMonth()-i,1);lineData.push({label:(d.getMonth()+1)+"月",value:records.filter(function(r){return r.category===cat.id&&sameM(r.date,d)}).reduce(function(s,r){return s+(r.hkdAmount||r.amount)},0)})}}
  var CS={card:{background:"#fff",borderRadius:14,margin:"8px 14px",padding:12,boxShadow:"0 2px 8px rgba(0,0,0,.04)"}};
  return h('div',null,
    editRec?h(EditPanel,{record:editRec,onSave:function(updates){onEdit(editRec,updates);setEditRec(null)},onClose:function(){setEditRec(null)},currencies:currencies}):null,
    h('div',{style:{background:"linear-gradient(135deg,#667eea,#764ba2)",color:"#fff",paddingTop:"max(env(safe-area-inset-top,0px),48px)",paddingLeft:16,paddingRight:16,paddingBottom:20,borderRadius:"0 0 24px 24px"}},
      h('div',{style:{display:"flex",alignItems:"center",marginBottom:10}},h('button',{onClick:onBack,style:{background:"rgba(255,255,255,.2)",border:"none",color:"#fff",borderRadius:8,padding:"4px 12px",cursor:"pointer",fontSize:14}},"‹ 返回"),h('span',{style:{flex:1,textAlign:"center",fontSize:17,fontWeight:600}},cat.icon+" "+cat.name),h('div',{style:{width:50}})),
      h('div',{style:{display:"flex",justifyContent:"center",gap:8,marginBottom:10}},["month","year"].map(function(m){return h('button',{key:m,onClick:function(){setDm(m)},style:{padding:"4px 16px",borderRadius:20,border:"none",background:dm===m?"rgba(255,255,255,.3)":"rgba(255,255,255,.1)",color:"#fff",fontSize:12,fontWeight:dm===m?600:400,cursor:"pointer"}},m==="month"?"月":"年")})),
      h('div',{style:{display:"flex",justifyContent:"space-between",alignItems:"center"}},h('button',{onClick:function(){if(isY)setVm(new Date(vm.getFullYear()-1,vm.getMonth(),1));else setVm(new Date(vm.getFullYear(),vm.getMonth()-1,1))},style:{background:"rgba(255,255,255,.2)",border:"none",color:"#fff",borderRadius:8,padding:"4px 12px",cursor:"pointer"}},"‹"),h('span',null,isY?yStr(vm):mStr(vm)),h('button',{onClick:function(){if(isY)setVm(new Date(vm.getFullYear()+1,vm.getMonth(),1));else setVm(new Date(vm.getFullYear(),vm.getMonth()+1,1))},style:{background:"rgba(255,255,255,.2)",border:"none",color:"#fff",borderRadius:8,padding:"4px 12px",cursor:"pointer"}},"›")),
      h('div',{style:{textAlign:"center",marginTop:10,fontSize:24,fontWeight:700}},"HK$ "+fmtN(total,0))),
    h('div',{style:CS.card},h('div',{style:{fontSize:14,fontWeight:600,marginBottom:12,color:"#333"}},isY?"各月趋势（HK$k）":"过去12个月（HK$k）"),h(LineChart,{data:lineData})),
    h('div',{style:CS.card},h('div',{style:{fontSize:14,fontWeight:600,marginBottom:12,color:"#333"}},"明细（"+sorted.length+"笔）"),sorted.length===0?h('div',{style:{color:"#bbb",textAlign:"center",padding:16}},"暂无数据"):sorted.map(function(r){var mem=fMem(r.member);var cur=fCur(r.currency||"HKD",currencies);var ih=(r.currency||"HKD")==="HKD";return h('div',{key:r.id,onClick:function(){setEditRec(r)},style:{display:"flex",alignItems:"center",padding:"8px 0",borderBottom:"1px solid #f5f5f5",cursor:"pointer"}},h('div',{style:{width:32,height:32,borderRadius:8,background:(r.categoryColor||"#eee")+"20",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}},r.categoryIcon),h('div',{style:{flex:1,marginLeft:10}},h('div',{style:{fontSize:13,color:"#333"}},r.date+" "+mem.avatar+" "+mem.name),h('div',{style:{fontSize:11,color:"#aaa",marginTop:2}},r.note||"-")),h('div',{style:{textAlign:"right"}},h('div',{style:{fontSize:14,fontWeight:600,color:"#e74c3c"}},ih?"HK$ "+fmtN(r.amount):cur.symbol+" "+fmtN(r.amount)),!ih?h('div',{style:{fontSize:10,color:"#aaa"}},"≈HK$"+fmtN(r.hkdAmount||0)):null))})));
}

// ========== MAIN APP ==========
function App(){
  var _fid=us(null),familyId=_fid[0],setFID=_fid[1];
  var _np=us(false),needPair=_np[0],setNP=_np[1];
  var _recs=us([]),records=_recs[0],setRecs=_recs[1];
  var _ld=us(true),loading=_ld[0],setLd=_ld[1];
  var _tab=us("add"),tab=_tab[0],setTab=_tab[1];
  var _sc=us(null),selCat=_sc[0],setSC=_sc[1];
  var _amt=us("0"),amount=_amt[0],setAmt=_amt[1];
  var _note=us(""),note=_note[0],setNote=_note[1];
  var _sd=us(fmtD(new Date())),selDate=_sd[0],setSD=_sd[1];
  var _scur=us("HKD"),selCurrency=_scur[0],setSCur=_scur[1];
  var _sdp=us(false),showDP=_sdp[0],setSDP=_sdp[1];
  var _vm=us(new Date()),viewMonth=_vm[0],setVM=_vm[1];
  var _toast=us(""),toast=_toast[0],setToast=_toast[1];
  var _currs=us(DEF_CURR),currencies=_currs[0],setCurrs=_currs[1];
  var _scm=us(false),showCM=_scm[0],setSCM=_scm[1];
  var _syn=us(false),syncing=_syn[0],setSyn=_syn[1];
  var _ls=us(null),lastSync=_ls[0],setLS=_ls[1];
  var _ol=us(navigator.onLine),online=_ol[0],setOL=_ol[1];
  var _mr=us(null),myRole=_mr[0],setMR=_mr[1];
  var _mc=us(1),memCnt=_mc[0],setMC=_mc[1];
  var _sm=us("month"),statMode=_sm[0],setSM=_sm[1];
  var _dc=us(null),drillCat=_dc[0],setDC=_dc[1];
  var _fn=us("我们的小家"),famName=_fn[0],setFN=_fn[1];
  var _en=us(false),editName=_en[0],setEN=_en[1];
  var _editRec=us(null),editRec=_editRec[0],setEditRec=_editRec[1];

  function showT(m){setToast(m);setTimeout(function(){setToast("")},1800)}
  ue(function(){var on=function(){setOL(true)},off=function(){setOL(false)};window.addEventListener('online',on);window.addEventListener('offline',off);return function(){window.removeEventListener('online',on);window.removeEventListener('offline',off)}},[]);
  var reload=uc(function(){return window.FamilyStorage.getAllRecords().then(function(r){r.sort(function(a,b){return new Date(b.date)-new Date(a.date)||(b.updatedAt||0)-(a.updatedAt||0)});setRecs(r);return Promise.all([window.FamilyStorage.getMeta('currencies',DEF_CURR),window.FamilyStorage.getMeta('lastSyncAt',0),window.FamilyStorage.getMeta('myRole',null),window.FamilyStorage.getMeta('familyName','我们的小家')])}).then(function(res){setCurrs(res[0]);setLS(res[1]);if(res[2])setMR(res[2]);setFN(res[3])})},[]);
  ue(function(){window.FamilyStorage.getFamilyId().then(function(f){if(!f){setNP(true);setLd(false);return}setFID(f);reload().then(function(){setLd(false);if(navigator.onLine&&window.FirebaseReady)doSync(f,true)})})},[]);
  // Listen for Firebase becoming ready (loads async in background)
  ue(function(){function onFBReady(){if(familyId&&navigator.onLine)doSync(familyId,true)}window.addEventListener('firebase-ready',onFBReady);return function(){window.removeEventListener('firebase-ready',onFBReady)}},[familyId]);
  ue(function(){var s=new Set();records.forEach(function(r){if(r.member)s.add(r.member)});setMC(Math.max(s.size,1))},[records]);

  function doSync(fid,silent){
    fid=fid||familyId;if(!fid||!window.FirebaseReady){if(!silent)showT("未就绪");return Promise.resolve()}
    if(!navigator.onLine){if(!silent)showT("离线");return Promise.resolve()}
    setSyn(true);
    return window.FamilyStorage.syncWithFirestore(window.FirebaseDB,fid,window.FirebaseModule).then(function(res){return reload().then(function(){if(!silent)showT("同步 ↑"+res.pushed+" ↓"+res.pulled);setSyn(false)})}).catch(function(e){console.error(e);if(!silent)showT("同步失败");setSyn(false)});
  }
  function createFam(r){if(!window.FirebaseReady)return Promise.reject(new Error("Firebase未配置"));var c=window.FamilyStorage.generatePairCode();var mod=window.FirebaseModule;return mod.setDoc(mod.doc(window.FirebaseDB,'families',c),{createdAt:Date.now()}).then(function(){return window.FamilyStorage.setFamilyId(c)}).then(function(){return window.FamilyStorage.setMeta('myRole',r)}).then(function(){return c})}
  function joinFam(c,r){if(!window.FirebaseReady)return Promise.reject(new Error("Firebase未配置"));var mod=window.FirebaseModule;return mod.getDoc(mod.doc(window.FirebaseDB,'families',c)).then(function(s){if(!s.exists())throw new Error("配对码不存在");return window.FamilyStorage.setFamilyId(c)}).then(function(){return window.FamilyStorage.setMeta('myRole',r)}).then(function(){setFID(c);setMR(r);setNP(false);setLd(true);return doSync(c,false)}).then(function(){return reload()}).then(function(){setLd(false)})}
  function logout(){if(!confirm("退出后本地清空，云端不受影响。确定？"))return;var req=indexedDB.deleteDatabase('family-budget');req.onsuccess=req.onerror=function(){window.location.reload()}}

  // Handle edit save
  function handleEditSave(updates){
    if(!editRec)return;
    var updated=Object.assign({},editRec,updates);
    window.FamilyStorage.putRecord(updated).then(function(){return reload()}).then(function(){showT("已修改");setEditRec(null)});
  }

  if(loading)return h('div',{style:{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",background:"#f8f9fa"}},h('div',{style:{textAlign:"center"}},h('div',{style:{fontSize:40,marginBottom:12}},"💰"),h('div',{style:{color:"#888"}},"加载中...")));
  if(needPair)return h(PairingScreen,{onCreate:createFam,onJoin:joinFam});

  var mRecs=records.filter(function(r){return sameM(r.date,viewMonth)});
  var mExp=mRecs.reduce(function(s,r){return s+(r.hkdAmount||r.amount)},0);
  var isY=statMode==="year";
  var sRecs=isY?records.filter(function(r){return sameY(r.date,viewMonth)}):mRecs;
  var sExp=sRecs.reduce(function(s,r){return s+(r.hkdAmount||r.amount)},0);
  var me=myRole?fMem(myRole):MEMBERS[0];
  var pc=records.filter(function(r){return r._pending}).length;

  function save(){if(!selCat){showT("请选择分类");return}var a=parseFloat(amount);if(!a||a<=0){showT("请输入金额");return}var c=fCur(selCurrency,currencies);window.FamilyStorage.putRecord({id:newId(),category:selCat.id,categoryName:selCat.name,categoryIcon:selCat.icon,categoryColor:selCat.color,amount:a,currency:selCurrency,hkdAmount:a*c.rate,note:note,date:selDate,member:myRole||"wife",createdAt:new Date().toISOString()}).then(function(){return reload()}).then(function(){setAmt("0");setNote("");setSC(null);showT("记账成功 ✓")})}
  function del(id){window.FamilyStorage.softDeleteRecord(id).then(function(){return reload()}).then(function(){showT("已删除")})}
  function saveCurrs(l){setCurrs(l);window.FamilyStorage.setMeta('currencies',l).then(function(){showT("已保存")})}
  function catData(recs){var m={};recs.forEach(function(r){m[r.category]=(m[r.category]||0)+(r.hkdAmount||r.amount)});return CATS.map(function(c){return{id:c.id,name:c.name,icon:c.icon,color:c.color,value:m[c.id]||0}}).filter(function(d){return d.value>0}).sort(function(a,b){return b.value-a.value})}
  function trendData(){var arr=[];if(isY){for(var i=0;i<12;i++){var d=new Date(viewMonth.getFullYear(),i,1);arr.push({label:(i+1)+"月",value:records.filter(function(r){return sameM(r.date,d)}).reduce(function(s,r){return s+(r.hkdAmount||r.amount)},0)})}}else{for(var i=11;i>=0;i--){var d=new Date(viewMonth.getFullYear(),viewMonth.getMonth()-i,1);arr.push({label:(d.getMonth()+1)+"月",value:records.filter(function(r){return sameM(r.date,d)}).reduce(function(s,r){return s+(r.hkdAmount||r.amount)},0)})}}return arr}
  function groupByDate(recs){var sorted=recs.slice().sort(function(a,b){return new Date(b.date)-new Date(a.date)});var m={},k=[];sorted.forEach(function(r){if(!m[r.date]){m[r.date]=[];k.push(r.date)}m[r.date].push(r)});return k.map(function(x){return[x,m[x]]})}

  var CS={card:{background:"#fff",borderRadius:14,margin:"8px 14px",padding:12,boxShadow:"0 2px 8px rgba(0,0,0,.04)"}};

  var TopBar=h('div',{style:{background:"linear-gradient(135deg,#667eea,#764ba2)",color:"#fff",paddingTop:"max(env(safe-area-inset-top,0px),48px)",paddingLeft:16,paddingRight:16,paddingBottom:4,display:'flex',justifyContent:'space-between',alignItems:'center',fontSize:11}},h('div',{style:{display:'flex',alignItems:'center',gap:6,opacity:.85}},h('span',{style:{width:6,height:6,borderRadius:'50%',background:online?'#7CFC9D':'#ffb74d',display:'inline-block'}}),h('span',null,online?'在线':'离线'),pc>0?h('span',{style:{background:'rgba(255,255,255,.25)',padding:'1px 6px',borderRadius:8}},pc+"待同步"):null),h('button',{onClick:function(){doSync()},disabled:syncing,style:{background:'rgba(255,255,255,.2)',border:'none',color:'#fff',borderRadius:12,padding:'4px 12px',fontSize:11,cursor:syncing?'default':'pointer',display:'flex',alignItems:'center',gap:4}},syncing?'⟳ 同步中':'🔄 刷新'));

  if(drillCat)return h(CatDetail,{cat:drillCat,records:records,viewMonth:viewMonth,statMode:statMode,currencies:currencies,onBack:function(){setDC(null)},onEdit:function(rec,updates){var updated=Object.assign({},rec,updates);window.FamilyStorage.putRecord(updated).then(function(){return reload()}).then(function(){showT("已修改")})}});

  // Tab content
  var tabContent=null;
  if(tab==="add"){
    var curr=fCur(selCurrency,currencies);var a=parseFloat(amount)||0;
    tabContent=h('div',{style:{display:"flex",flexDirection:"column",height:"calc(100vh - 70px)",overflow:"hidden"}},TopBar,
      h('div',{style:{background:"linear-gradient(135deg,#667eea,#764ba2)",padding:"8px 20px 14px",borderRadius:"0 0 24px 24px",color:"#fff",textAlign:"center"}},h('div',{style:{fontSize:12,opacity:.8}},selCat?selCat.icon+" "+selCat.name:"请选择分类"),h('div',{style:{fontSize:28,fontWeight:700,margin:"2px 0"}},curr.symbol+" "+amount),selCurrency!=="HKD"&&a>0?h('div',{style:{fontSize:12,opacity:.8}},"≈ HK$ "+fmtN(a*curr.rate)):null,h('div',{style:{fontSize:11,opacity:.6,marginTop:2}},me.avatar+" "+me.name+" 记账中")),
      h('div',{style:{display:"flex",gap:5,padding:"4px 14px 0",flexWrap:"wrap"}},currencies.map(function(c){var s=selCurrency===c.code;return h('button',{key:c.code,onClick:function(){setSCur(c.code)},style:{padding:"3px 10px",border:s?"2px solid #667eea":"2px solid #e8e8e8",borderRadius:20,fontSize:11,fontWeight:s?700:400,background:s?"rgba(102,126,234,.08)":"#fff",color:s?"#667eea":"#666",cursor:"pointer"}},c.symbol+" "+c.name)})),
      h('div',{style:{background:"#fff",borderRadius:14,margin:"4px 14px",padding:"6px 10px",boxShadow:"0 2px 8px rgba(0,0,0,.04)"}},h(CatPicker,{selCat:selCat,onSelect:function(c){setSC(c)}})),
      h('div',{style:{background:"#fff",borderRadius:14,margin:"0 14px",padding:"6px 10px",boxShadow:"0 2px 8px rgba(0,0,0,.04)",flex:1,display:"flex",flexDirection:"column"}},
        h('div',{style:{display:"flex",gap:6,marginBottom:4}},h('button',{onClick:function(){setSDP(true)},style:{flex:3,padding:"5px 10px",border:"1px solid #eee",borderRadius:10,background:"#fafafa",cursor:"pointer",fontSize:12,textAlign:"left",color:"#555"}},"📅 "+selDate+" "+WD[new Date(selDate).getDay()]),h('input',{value:note,onChange:function(e){setNote(e.target.value)},placeholder:"备注",style:{flex:2,padding:"5px 10px",border:"1px solid #eee",borderRadius:10,fontSize:12,outline:"none"}})),
        h('div',{style:{flex:1}},h(NumPad,{value:amount,onCh:function(v){setAmt(v)},onDel:function(){setAmt(function(p){return p.length<=1?"0":p.slice(0,-1)})}})),
        h('button',{onClick:save,style:{width:"100%",padding:9,marginTop:2,border:"none",borderRadius:12,fontSize:15,fontWeight:700,background:"linear-gradient(135deg,#667eea,#764ba2)",color:"#fff",cursor:"pointer"}},"记一笔 ✓")));
  }else if(tab==="home"){
    var gd=groupByDate(mRecs);
    tabContent=h('div',null,TopBar,
      h('div',{style:{background:"linear-gradient(135deg,#667eea,#764ba2)",color:"#fff",padding:"8px 20px 20px",borderRadius:"0 0 24px 24px"}},
        h('div',{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}},h('button',{onClick:function(){setVM(new Date(viewMonth.getFullYear(),viewMonth.getMonth()-1,1))},style:{background:"rgba(255,255,255,.2)",border:"none",color:"#fff",borderRadius:8,padding:"4px 12px",cursor:"pointer"}},"‹"),h('span',{style:{fontSize:17,fontWeight:600}},mStr(viewMonth)),h('button',{onClick:function(){setVM(new Date(viewMonth.getFullYear(),viewMonth.getMonth()+1,1))},style:{background:"rgba(255,255,255,.2)",border:"none",color:"#fff",borderRadius:8,padding:"4px 12px",cursor:"pointer"}},"›")),
        h('div',{style:{textAlign:"center"}},h('div',{style:{fontSize:12,opacity:.8}},"本月支出"),h('div',{style:{fontSize:28,fontWeight:700}},"HK$ "+fmtN(mExp)),h('div',{style:{fontSize:12,opacity:.7,marginTop:4}},mRecs.length+"笔"))),
      mRecs.length===0?h('div',{style:{textAlign:"center",padding:60,color:"#bbb"}},h('div',{style:{fontSize:48,marginBottom:12}},"📒"),"本月暂无记录"):
      gd.map(function(g){var date=g[0],recs=g[1];var dt=recs.reduce(function(s,r){return s+(r.hkdAmount||r.amount)},0);var d=new Date(date);
        return h('div',{key:date,style:CS.card},
          h('div',{style:{display:"flex",justifyContent:"space-between",marginBottom:10,fontSize:13,color:"#888"}},h('span',null,(d.getMonth()+1)+"月"+d.getDate()+"日 "+WD[d.getDay()]),h('span',null,"HK$ "+fmtN(dt))),
          recs.map(function(r){var mem=fMem(r.member),cur=fCur(r.currency||"HKD",currencies),ih=(r.currency||"HKD")==="HKD";
            return h('div',{key:r.id,onClick:function(){setEditRec(r)},style:{display:"flex",alignItems:"center",padding:"8px 0",borderBottom:"1px solid #f5f5f5",cursor:"pointer"}},
              h('div',{style:{width:38,height:38,borderRadius:10,background:(r.categoryColor||"#eee")+"20",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}},r.categoryIcon),
              h('div',{style:{flex:1,marginLeft:12}},h('div',{style:{fontSize:14,fontWeight:500,color:"#333"}},r.categoryName,r._pending?h('span',{style:{marginLeft:6,fontSize:9,color:'#ffa726',background:'#fff3e0',padding:'1px 5px',borderRadius:6}},"待同步"):null),h('div',{style:{fontSize:11,color:"#aaa",marginTop:2}},mem.avatar+" "+mem.name+(r.note?" · "+r.note:""))),
              h('div',{style:{textAlign:"right"}},h('div',{style:{fontSize:15,fontWeight:600,color:"#e74c3c"}},ih?"HK$ "+fmtN(r.amount):cur.symbol+" "+fmtN(r.amount)),!ih?h('div',{style:{fontSize:10,color:"#aaa"}},"≈HK$"+fmtN(r.hkdAmount||0)):null),
              h('button',{onClick:function(e){e.stopPropagation();del(r.id)},style:{marginLeft:6,border:"none",background:"none",color:"#ddd",fontSize:16,cursor:"pointer",padding:4}},"×"))}))}));
  }else if(tab==="stats"){
    var data=catData(sRecs);var pie=data.map(function(d){return{name:d.name,value:d.value,color:d.color}});
    var nP=function(){if(isY)setVM(new Date(viewMonth.getFullYear()-1,viewMonth.getMonth(),1));else setVM(new Date(viewMonth.getFullYear(),viewMonth.getMonth()-1,1))};
    var nN=function(){if(isY)setVM(new Date(viewMonth.getFullYear()+1,viewMonth.getMonth(),1));else setVM(new Date(viewMonth.getFullYear(),viewMonth.getMonth()+1,1))};
    tabContent=h('div',null,TopBar,
      h('div',{style:{background:"linear-gradient(135deg,#667eea,#764ba2)",padding:"4px 20px 20px",borderRadius:"0 0 24px 24px",color:"#fff"}},
        h('div',{style:{textAlign:"center",fontSize:17,fontWeight:600,marginBottom:8}},"统计报表"),
        h('div',{style:{display:"flex",justifyContent:"center",gap:8,marginBottom:10}},["month","year"].map(function(m){return h('button',{key:m,onClick:function(){setSM(m)},style:{padding:"4px 16px",borderRadius:20,border:"none",background:statMode===m?"rgba(255,255,255,.3)":"rgba(255,255,255,.1)",color:"#fff",fontSize:12,fontWeight:statMode===m?600:400,cursor:"pointer"}},m==="month"?"月":"年")})),
        h('div',{style:{display:"flex",justifyContent:"space-between",alignItems:"center"}},h('button',{onClick:nP,style:{background:"rgba(255,255,255,.2)",border:"none",color:"#fff",borderRadius:8,padding:"4px 12px",cursor:"pointer"}},"‹"),h('span',null,isY?yStr(viewMonth):mStr(viewMonth)),h('button',{onClick:nN,style:{background:"rgba(255,255,255,.2)",border:"none",color:"#fff",borderRadius:8,padding:"4px 12px",cursor:"pointer"}},"›")),
        h('div',{style:{textAlign:"center",marginTop:12,fontSize:24,fontWeight:700}},"HK$ "+fmtN(sExp,0))),
      h('div',{style:CS.card},h('div',{style:{fontSize:14,fontWeight:600,marginBottom:12,color:"#333"}},"分类占比（%）"),h(PieChart,{data:pie,size:260})),
      h('div',{style:CS.card},h('div',{style:{fontSize:14,fontWeight:600,marginBottom:12,color:"#333"}},"各月趋势（HK$k）"),h(LineChart,{data:trendData()})),
      h('div',{style:CS.card},h('div',{style:{fontSize:14,fontWeight:600,marginBottom:12,color:"#333"}},"分类排行（HK$）"),data.length===0?h('div',{style:{color:"#bbb",textAlign:"center",padding:16}},"暂无数据"):data.map(function(d){var pct=sExp>0?d.value/sExp*100:0;return h('div',{key:d.id,onClick:function(){setDC(d)},style:{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:"1px solid #f5f5f5",cursor:"pointer"}},h('span',{style:{fontSize:22}},d.icon),h('div',{style:{flex:1}},h('div',{style:{display:"flex",justifyContent:"space-between",marginBottom:4}},h('span',{style:{fontSize:13,fontWeight:500}},d.name),h('span',{style:{fontSize:13,fontWeight:600}},fmtInt(d.value))),h('div',{style:{background:"#f0f0f0",borderRadius:3,height:5,overflow:"hidden"}},h('div',{style:{width:pct+"%",height:"100%",background:d.color,borderRadius:3}}))),h('span',{style:{fontSize:12,color:"#999",width:30,textAlign:"right"}},pct.toFixed(0)+"%"),h('span',{style:{color:"#ccc",fontSize:14}},"›"))})),
      h('div',{style:CS.card},h('div',{style:{fontSize:14,fontWeight:600,marginBottom:12,color:"#333"}},"成员支出（HK$）"),h('div',{style:{display:"flex",gap:12}},MEMBERS.map(function(m){var mt=sRecs.filter(function(r){return r.member===m.id}).reduce(function(s,r){return s+(r.hkdAmount||r.amount)},0);return h('div',{key:m.id,style:{flex:1,background:m.color+"10",borderRadius:12,padding:16,textAlign:"center"}},h('div',{style:{fontSize:32}},m.avatar),h('div',{style:{fontSize:13,fontWeight:500,margin:"4px 0",color:"#555"}},m.name),h('div',{style:{fontSize:18,fontWeight:700,color:m.color}},fmtInt(mt)))}))));
  }else if(tab==="mine"){
    var yr=new Date().getFullYear();var yrRecs=records.filter(function(r){return new Date(r.date).getFullYear()===yr});var te=yrRecs.reduce(function(s,r){return s+(r.hkdAmount||r.amount)},0);var ds={};records.forEach(function(r){ds[r.date]=true});var td=Object.keys(ds).length;var lss=lastSync?new Date(lastSync).toLocaleString('zh-CN'):'从未';
    function saveName(v){window.FamilyStorage.setMeta('familyName',v).then(function(){setEN(false)})}
    tabContent=h('div',null,TopBar,
      h('div',{style:{background:"linear-gradient(135deg,#667eea,#764ba2)",padding:"12px 20px 28px",borderRadius:"0 0 24px 24px",color:"#fff",textAlign:"center"}},
        h('div',{style:{fontSize:48,marginBottom:4}},"👨‍👩‍👧‍👦"),
        editName?h('div',{style:{display:"flex",alignItems:"center",justifyContent:"center",gap:8}},h('input',{value:famName,onChange:function(e){setFN(e.target.value)},style:{fontSize:16,fontWeight:700,textAlign:"center",background:"rgba(255,255,255,.2)",border:"1px solid rgba(255,255,255,.4)",borderRadius:8,color:"#fff",padding:"4px 12px",outline:"none",width:160}}),h('button',{onClick:function(){saveName(famName)},style:{background:"rgba(255,255,255,.3)",border:"none",color:"#fff",borderRadius:8,padding:"4px 10px",fontSize:13,cursor:"pointer"}},"✓")):h('div',{onClick:function(){setEN(true)},style:{fontSize:18,fontWeight:700,cursor:"pointer"}},famName+" ✏️"),
        h('div',{style:{fontSize:13,opacity:.8,marginTop:4}},td+"天 · "+fmtN(records.length,0)+"笔 · "+memCnt+"位成员")),
      h('div',{style:{padding:"12px 16px 0"}},h('div',{style:{background:"#fff",borderRadius:16,padding:16,textAlign:"center",boxShadow:"0 2px 8px rgba(0,0,0,.04)"}},h('div',{style:{fontSize:12,color:"#999"}},yr+"年累计支出"),h('div',{style:{fontSize:24,fontWeight:700,color:"#e74c3c",marginTop:4}},"HK$ "+fmtN(te,0)))),
      h('div',{style:CS.card},h('div',{style:{fontSize:14,fontWeight:600,marginBottom:12,color:"#333"}},"我的身份"),h('div',{style:{display:'flex',gap:10,justifyContent:'center'}},MEMBERS.map(function(m){var s=myRole===m.id;return h('div',{key:m.id,style:{padding:'12px 24px',border:s?'2px solid '+m.color:'2px solid #eee',borderRadius:12,background:s?m.color+'15':'#fff',textAlign:'center'}},h('div',{style:{fontSize:28}},m.avatar),h('div',{style:{fontSize:13,fontWeight:s?600:400,color:s?m.color:'#888',marginTop:4}},m.name))}))),
      h('div',{style:CS.card},h('div',{style:{fontSize:14,fontWeight:600,marginBottom:12,color:"#333"}},"家庭配对码"),h('div',{style:{background:'#f5f3ff',borderRadius:12,padding:16,textAlign:'center'}},h('div',{style:{fontSize:28,fontWeight:700,letterSpacing:4,color:'#667eea',fontFamily:'monospace'}},familyId)),h('div',{style:{fontSize:11,color:'#aaa',marginTop:10,textAlign:'center'}},"上次同步："+lss)),
      h('div',{style:CS.card},h('div',{style:{fontSize:14,fontWeight:600,marginBottom:12,color:"#333"}},"货币与汇率"),h('div',{style:{display:"flex",flexWrap:"wrap",gap:6,marginBottom:12}},currencies.map(function(c){return h('span',{key:c.code,style:{padding:"4px 10px",background:"#f5f5f5",borderRadius:8,fontSize:12,color:"#555"}},c.symbol+" "+c.name+(c.code!=="HKD"?" (1="+c.rate+"HKD)":""))})),h('button',{onClick:function(){setSCM(true)},style:{width:"100%",padding:10,border:"1px solid #667eea",borderRadius:10,background:"#fff",color:"#667eea",fontSize:13,fontWeight:600,cursor:"pointer"}},"管理货币与汇率")),
      h('div',{style:CS.card},h('button',{onClick:logout,style:{width:"100%",padding:12,border:"1px solid #e74c3c",borderRadius:10,background:"#fff",color:"#e74c3c",fontSize:14,fontWeight:600,cursor:"pointer"}},"退出家庭"),h('div',{style:{fontSize:11,color:"#aaa",textAlign:"center",marginTop:8}},"云端数据不受影响")),
      h('div',{style:{textAlign:"center",padding:24,color:"#ccc",fontSize:12}},"v5.0 · 本地优先 · 云端同步"));
  }

  var TABS=[{id:"add",icon:"➕",label:"记账",big:true},{id:"home",icon:"📒",label:"明细"},{id:"stats",icon:"📊",label:"统计"},{id:"mine",icon:"👤",label:"我的"}];

  return h('div',{style:{maxWidth:430,margin:"0 auto",background:"#f5f6fa",minHeight:"100vh",position:"relative",fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",paddingBottom:70}},
    toast?h('div',{style:{position:"fixed",top:80,left:"50%",transform:"translateX(-50%)",background:"rgba(0,0,0,.75)",color:"#fff",padding:"10px 24px",borderRadius:20,fontSize:14,zIndex:2000,pointerEvents:"none"}},toast):null,
    showDP?h(DateModal,{value:selDate,onPick:function(v){setSD(v)},onClose:function(){setSDP(false)}}):null,
    showCM?h(CurrModal,{currs:currencies,onSave:saveCurrs,onClose:function(){setSCM(false)}}):null,
    editRec?h(EditPanel,{record:editRec,onSave:handleEditSave,onClose:function(){setEditRec(null)},currencies:currencies}):null,
    tabContent,
    h('div',{style:{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,background:"#fff",display:"flex",borderTop:"1px solid #eee",zIndex:100,paddingBottom:"env(safe-area-inset-bottom,0px)"}},TABS.map(function(t){var active=tab===t.id;return h('button',{key:t.id,onClick:function(){setTab(t.id);setDC(null)},style:{flex:1,padding:"8px 0 6px",textAlign:"center",border:"none",background:"none",color:active?"#667eea":"#999",fontSize:11,fontWeight:active?600:400,cursor:"pointer"}},h('div',{style:{fontSize:t.big?26:22,lineHeight:"1"}},t.icon),h('div',null,t.label))})));
}

ReactDOM.createRoot(document.getElementById('root')).render(h(App));
