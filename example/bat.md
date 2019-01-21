#   Baidu

^.RESPONSE.bodyBuffer.length "80+/-10"  
http://baidu.com/  
^.RESPONSE.statusCode 302  
https://baidu.com/  
http://220.181.57.216/  

#   Alibaba

http://alibaba.com/  
http://taobao.com/  
^.REQUEST.headers.Host "taobao.com"  
http://140.205.94.189/  
http://tmall.com/  

#   Tencent

^.GROUP.START
^.RESPONSE.statusCode 200
http://tencent.com/  
http://qq.com/  
http://weixin.com/  
^.GROUP.END