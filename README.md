## MinecraftServerPing

一个获取服务器信息的 API

端点
``` 
GET /ping/example.com
```

会自动解析 SRV，返回 200 为成功，500 为失败

响应示例：


200 OK JSON
```json
{
    "target": "sj.jsumc.fun:25565", 
    "info": {
        "version": {
            "protocol": 773, 
            "name": "Velocity 1.7.2-1.21.10"
        }, 
        "players": {
            "online": 0, 
            "max": 2025, 
            "sample": [ ]
        }, 
        "description": {
            "extra": [
                {
                    "color": "green", 
                    "text": "江苏大学"
                }, 
                {
                    "color": "yellow", 
                    "text": "Minecraft"
                }, 
                {
                    "color": "green", 
                    "text": "同好会 "
                }
            ], 
            "text": ""
        }, 
        "favicon": "data:image/png;base64,XXX"
    }, 
    "latency": 34
}
```

失败则直接返回错误信息。

## SJMCL DataSource Transfer

将其他数据源转换为 SJMCL 数据源。  
目前支持：RSS。

端点
``` 
GET /sjmcl/rss/https://example.com/rss.xml
```

响应示例：

```json
{
  "next": 2562,
  "posts": [
    {
      "abstract": "\u003Cp\u003E“学在交大”是交大人对待学业的共识今年，在上海交通大学Minecraft社（SJMC）的6位部长，顺利保研让我们一起听听他们的感想 &#8230;\u003C/p\u003E",
      "createAt": "2025-10-18T12:05:00",
      "id": 2592,
      "imageSrc": [
        "https://mc.sjtu.cn/wp-content/uploads/2025/10/1760714535-容器-106@1x.png",
        1508, 640],
      "keywords": "上海交通大学,学业分享",
      "link": "https://mc.sjtu.cn/2025/10/18/exam-free-recommendation-22/",
      "source": {
        "endpointUrl": "https://mc.sjtu.cn/api-sjmcl/article",
        "fullName": "上海交通大学 Minecraft 社",
        "iconSrc": "https://mc.sjtu.cn/wp-content/uploads/2022/03/mcclub-512px.png",
        "name": "SJMC"
      },
      "title": "22级6位保研，来听听交大MC社部长团的保研经验分享~",
      "updateAt": "2025-10-17T23:24:17"
    }
  ],
  "sourceInfo": {
    "endpointUrl": "https://mc.sjtu.cn/api-sjmcl/article",
    "fullName": "上海交通大学 Minecraft 社",
    "iconSrc": "https://mc.sjtu.cn/wp-content/uploads/2022/03/mcclub-512px.png",
    "name": "SJMC"
  }
}
```
