# 项目安装流程

## 1. 安装 node、npm
### 1.1 下载、安装
网上下载node.msi、安装文件包，里面包含了node.js和npm
选择v4.x.x版本下载
安装过程全部默认即可,node安装包中包含了npm,所以node安装完成后npm也就完成安装

### 1.2 配置环境变量
node的安装的根目录（这里以：D:\Program Files\nodejs 为例）

找到 控制面板 -> 所有控制面板项 -> 系统 -> 高级系统设置 -> 环境变量
在用户变量path值最后添加  ;D:\Program Files\nodejs\
（注意：因为我是把nodejs安装在D:\Program Files\nodejs目录下，所以环境变量就这样设置的）

在任意磁盘任意位置执行命令行：
$ node -v 和 $ npm -v 
可以得到其版本号，则node、npm安装并配置完成 


## 2. 全局安装 gulp
从此处开始建议挂VPN后执行
命令行执行 

$ npm install gulp -g 

执行完成后 

$ gulp -v 

得到gulp版本号，则安装成功


## 3. 全局安装 cordova
命令行执行

$ npm install cordova -g

执行完成后 

$ cordova -v 

得到cordova版本号，则安装成功


## 4. 全局安装 ionic
命令行执行 
$ npm install ionic -g 

执行完成后

$ ionic -v 

得到ionic版本号，则安装成功


## 5. 全局安装 bower
命令行执行 

$ npm install bower -g

执行完成后 

$ bower -v 

得到bower版本号，则安装成功

## 6. 在项目文件目录下安装npm
命令行执行 

$ npm install 

## 7. 在项目文件目录下安装bower
命令行执行 

$ bower install 

至此项目所需环境已搭建完成

## 8. 运行项目
命令行执行 

$ gulp sass-compile 
$ gulp sass-component-compile
$ gulp sprite

最后命令行执行 

$ ionic serve 或 $ ionic serve --address 192.168.1.118 --port 8010（注意：192.168.1.118为本机IP，8010为端口号）




