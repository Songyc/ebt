/*
* sqhom on 20140731
* 解析URL参数
*/
function request(paras) {
            var url = location.href;
            var paraString = url.substring(url.indexOf("?") + 1, url.length).split("&");

            var returnValue;
            for (i = 0; i < paraString.length; i++) {
                var tempParas = paraString[i].split('=')[0];
                var parasValue = paraString[i].split('=')[1];

                if (tempParas === paras)
                    returnValue = parasValue;
            }

            if (typeof(returnValue) == "undefined") {
                return "";
            } else {
                return returnValue;
            }
        }
/*
* sqhom on 20140731
* 加载缓存信息
*/
function getLocalStorageKey(prefix){
            if(prefix !==null && prefix !==undefined){
            return prefix 
               + Piece.Session.loadObject("acType") 
               + "_" 
               + Piece.Session.loadObject("companyId");
            }else{
                return null;
            }    
        }
function getLocalStorageValue(prefix){
            if(prefix !==null && prefix !==undefined){
            return Piece.Store.loadObject(prefix);
            }else{
                return null;
            }    
        }