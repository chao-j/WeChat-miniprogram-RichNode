var nodesArr=new Array();
//获取md格式文本，分析格式
function getMdText(mdText) {
  var temp = mdText.split('\r\n');
  var lines = new Array();
  for (var i = 0; i < temp.length; i++) {
    if (temp[i] != '') {
      lines.push(temp[i]) //去除md文本里的空行
    }
  }
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i];
    //前缀+空格型
    if (/^(# |## |### |#### |##### |###### )/.test(line)) {      //标题
      nodesArr.push(setTitle(line));
      //console.log(1+"  "+line)
    } 
    else if (/^\s*(\* |\- |\+ |\d.)/.test(line)) {      //列表
      nodesArr.push(setList(line));
      //console.log(2 + "  " + line)
    }
    else if (/^\*{3,}$|^\-{3,}$|^_{3,}$/.test(line)){     //水平线
      nodesArr.push(setDividLine());
      //console.log(3 + "  " + line)
    }
    else if (/^(> |>)/.test(line)){   //区块
      nodesArr.push(setBlock(line))
    }
    else if(/^`{3,3}/.test(line)){  //代码块
      var type=line.replace(/```/,'language:');
      var code=new Array();
      code.push(type);
      var j=i+1;
      var tp=i;
      var isEnd=false;
      while (!isEnd) {  
        //防止测试时进入死循环
        // if (j >= tp+10) {
        //   console.log(j)
        //   break;
        // }
        if (/^`{3,3}$/.test(lines[j])) {
          isEnd=true;
        }else{
          code.push(lines[j])
        }
        j++;
      }
      if(isEnd) {
        i=j-1;
      }
      nodesArr.push(setCodeBlock(code));
    }
    else{     //段落
      //console.log(5 + "  " + line)
      //console.log(line)
      nodesArr.push(setPgh(line));
      //console.log(setPgh(line))
    }

  }

  //合成nodes
  var nodes="[";
  var temp=nodesArr.join(',');
  nodes+=temp+']';
  return JSON.parse(nodes);
}
//----------行级元素且 不包含其他元素节点------------
//解析标题
function setTitle(line){
  var rm_pre = line.replace(/^(# |## |### |#### |##### |###### )/, '');  //去除前缀
  var title = rm_pre.replace(/ #+$/, ''); //去除后缀 如果有的话
  var title_level = line.length - rm_pre.length - 1;  //标题级别
  return createTextNode('h' + title_level, 'h' +title_level,'',title.trim());
}
//解析列表
function setList(line){
  var indent = line.search(/(\* |\- |\+ |\d.)/);
  //列表缩进和无序列表样式
  var style = style = "text-indent:" + indent / 2 + "rem;"  
  if (/^\s*(\d. )/.test(line))
  {
    style+="list-style:none"
    return createTextNode('li', 'li', style, line.replace(/^\s*/,''))
  }
  else{
    var list_style='';
    switch(indent){
      case 0:list_style='disc';break;
      case 4: list_style ='circle';break;
      case 8: list_style ='square';break;
      default:list_style="square";break;
    }
    style +='list-style:'+list_style;
    return createTextNode('li', 'li', style, line.replace(/^\s*(\* |\- |\+ )/,''));
  }
}
//解析水平分割线
function setDividLine(){
  return createNullChild('hr','hr');
}
//解析图片
function setImg(line){
  var altStr = /!\[.*?]/.exec(line)[0];
  var alt = altStr.replace(/^(!\[)|\]$/g, '');
  var srcStr = /\(.*?\)/.exec(line)[0];
  var src = srcStr.replace(/".*?"|\(|\)/g, "");
  return "{\"name\":\"img\",\"attrs\":{\"class\":\"img\",\"src\":\"" + src + "\",\"alt\":\"" + alt + "\"}}";
}
//----------------------行内元素 不包含子节点
//解析a链接
function setLink(line){
  return createTextNode('a', 'a', '', line.replace(/<|>|\(|\)/g, ''))
}
//解析粗体
function setBlod(line){
  return createTextNode('span', 'blod', '', line.replace(/^(\*{2,2}|_{2,2})|(\*{2,2}|_{2,2})$/g, ''))
}
//解析斜体
function setItalic(line){
  return createTextNode('span', 'italic', '', line.replace(/^(\*|_)|(\*|_)$/g, ''))
}
//解析粗斜体
function setBlodItalic(line){
  return createTextNode('span', 'blod-italic', '', line.replace(/^(\*{3,3}|_{3,3})|(\*{3,3}|_{3,3})$/g, ''))
}
//解析删除题
function setDel(line){
  return createTextNode('span', 'delete', '', line.replace(/^~{2,2}|~{2,2}$/g, ''))
}
//解析行内代码片段
function setCodeFrag(line){
  var code = replaceCodeChar(line); //替换代码内特殊字符
  return createTextNode('span', 'code-frag', '', code.replace(/^`|`$/g, ''))
}
//----------------行级元素 包含子节点
//解析代码区块
function setCodeBlock(code) {
  var children = new Array();
  for (var i = 0; i < code.length; i++) {
    children.push(createTextNode('span', 'code-line', 'display:block', replaceCodeChar(code[i])))
  }
  console.log(children)
  var nodesStr = children.join(',');
  return createChildNode('div', 'code-block', '', nodesStr);
}
//解析段落
function setPgh(line){
  //console.log(line)
  var nodesStr=analyInline(line);
  //console.log(nodesStr)
  return createChildNode('p','p','',nodesStr);
}
//解析区块
function setBlock(line){
  var nodesStr=analyInline(line.replace(/^(> |>)/,''));
  //console.log(line.replace(/^(> )/, ''))
  return createChildNode('p','block','',nodesStr)
}
//解析段落中的特殊格式 返回一个具有多个子节点的节点
function analyInline(line){
  var patt = /\*{3,3}.*?\*{3,3}|_{3,3}.*?_{3,3}|\*{2,2}.*?\*{2,2}|_{2,2}.*?_{2,2}|\*.*?\*|_.*?_|~{2,2}.*?~{2,2}|\[.*?\]\(.*?\)|<.*?>|!\[.*?\]\(.*?\)|`.*?`/g;
  var texts = line.split(patt); //text节点内容
  var elems = line.match(patt); //node节点内容
  var textChildren = new Array(); //存储text子节点{type:text,text:line}
  var nodeChildren = new Array(); //存储node子节点 {type:node,node:lin}
  var children = new Array();
  //console.log(texts)
  //行首行尾存在分割符时 split会导致产生的数组前后有null
  if (texts[texts.length - 1] == "") {
    texts.pop();
  }
  if (texts[0] == "") {
    texts.shift()
  }
  //console.log(texts)
  for (var i = 0; i < texts.length; i++) {
    if (/^\s*(\* |\- |\+ |\d.)/.test(texts[i])){  //区块里面可能存在列表
      textChildren.push(setList(texts[i]));
      continue;
    }
    textChildren.push(createTextChild(texts[i]));
  }
  if(elems!=null){
    for (var i = 0; i < elems.length; i++) {
      var elem = elems[i];
      var node = null;
      if (/^\*{3,3}.*?\*{3,3}$|^_{3,3}.*?_{3,3}$/.test(elem)) {   //粗斜体
        node = setBlodItalic(elem);
      }
      else if (/^\*{2,2}.*?\*{2,2}$|^_{2,2}.*?_{2,2}$/.test(elem)) {  //粗体
        node = setBlod(elem);
      }
      else if (/\*.*?\*|_.*?_/.test(elem)) {   //斜体
        node = setItalic(elem);
      }
      else if (/~~.*?~~/.test(elem)) {    //删除线
        node = setDel(elem);
      }
      else if (/!\[.*?\]\(.*?\)/.test(elem)) {    //图片
        node = setImg(elem);
      }
      else if (/\[.*?\]\(.*?\)|<.*?>/.test(elem)) {   //链接
        node = setLink(elem);
      }
      else if (/`.*?`/.test(elem)){
        node = setCodeFrag(elem);
      }
      nodeChildren.push(node);
    }
  }
  


  var first = nodeChildren;
  var second = textChildren;
  if (line.search(patt) > 0) {    //开头是text
    first = textChildren;
    second = nodeChildren;
  }
  // console.log(first);
  // console.log(second)
  var flen = 0;
  var slen = 0;
  while (flen < first.length || slen < second.length) {
    if (flen < first.length) {
      children.push(first[flen]);
      flen++;
    }
    if (slen < second.length) {
      children.push(second[slen]);
      slen++;
    }
  }
  // for(var i=0;i<children.length;i++){
  //   console.log(i+"     "+children[i])
  // }
  var nodesStr = children.join(',');
  return nodesStr;
}
//生成一个没有子节点的节点
function createNullChild(name,cla,style){
  return "{\"name\":\"" + name + "\",\"attrs\":{\"class\":\"" + cla + "\",\"style\":\"" + style + "\"}}";
}
//有子节点-text节点
function createTextNode(name,cla,style,text){
  // nodesArr.push("{\"name\":\"" + name + "\",\"attrs\":{\"class\":\"" + cla +"\",\"style\":\""+style+"\"},\"children\":[{\"type\":\"text\",\"text\":\"" + text + "\"}]}"); 
  return "{\"name\":\"" + name + "\",\"attrs\":{\"class\":\"" + cla + "\",\"style\":\"" + style + "\"},\"children\":[{\"type\":\"text\",\"text\":\"" + text + "\"}]}";
}
//有子节点-node节点
function createChildNode(name,cla,style,nodes){
  return "{\"name\":\"" + name + "\",\"attrs\":{\"class\":\"" + cla + "\",\"style\":\"" + style + "\"},\"children\":["+nodes+"]}";
}

//生成node子节点
function createTextChild(text){
  return "{\"type\": \"text\",\"text\": \""+text+"\"\}"
}

//替换代码内特殊字符
function replaceCodeChar(line){
  var code = line.replace(/"/g, '\\"');
  code = code.replace(/\//g, '\\/');
  code = code.replace(/\t/g, '    ');
  return code;
}
module.exports = {
  getMdText: getMdText,
  replaceCodeChar:replaceCodeChar
}