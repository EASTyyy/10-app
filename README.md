# ionic打包
新的项目中需要复制`www/other/config.debug.js`或者`www/other/config.release.js`为`www/other/config.js`，因为`index.html`中引用的是`www/other/config.js`，具体需要修改什么配置则在`www/other/config.js`中改即可

检查项目根目录的`config.xml`中配置是否为`widget id="com.yilinstyle.fashionshow"`，如果不是修改完即可

## 1. ionic build ios
### 1.1 准备
项目先从`svn`弄到本地，这个项目目前还没有添加iOS的平台，除了一些默认自带的插件，其他的插件也都没有安装，现在需要将这个项目打包成一个可以在iPhone上运行的app，
首先需要准备好本地Mac的环境配置，需要安装`node.js`, Xcode, ionic, cordova, gulp, bower. gulp和bower需要全局安装。gulp需要安装的原因是项目中css样式使用scss编写，
所以需要转换。运行时候需要的js文件也需要安装一下，进入到项目的根目录下，运行如下的命令：

    $ sudo npm install
    $ sudo bower install --allow-root
等待所有的依赖安装完成

这个过程中，有可能需要使用到管理员权限，如果不需要就不用处理.npm如果一直没有结果，那么试试科学上网

### 1.2 添加iOS平台
添加平台之前，可以先使用webstorm打开项目，打开`hooks/after_prepare/010_add_platform_class.js`文件，修改右下角的`CLRF`为`LF`，然后保存即可。
因为原来的项目时windows平台创建，换行符不一致，Mac上面不能用，否则就会报错，你如果有其他的方式修改也可以，反正修改了即可。

然后运行： (如果需要权限则用sudo方式运行)

    $ ionic platform add ios

可以试着运行打包的命令，看看再还没有添加插件之前是否可以运行：

    $ gulp sass-compile
    $ gulp sprite
    $ gulp sass-component-compile
    $ ionic build ios

如果再gulp的过程中有错误，那么试试删除`node_modules`这个文件夹，重新 `npm install`,记得挂个VPN

### 1.3 安装证书
这一步如果证书已经安装好了即可不管了，否则就需要一步步安装好证书

开发者证书需要下载好，所需的证书有，证书可以从Apple开发者官网下载

    ios_development.cer
    ios_distribution.cer

    yilinstyle_dev.pp.mobileprovision
    yilinstyle_pub.pp.mobileprovision

`.cer` 是证书文件,双击后会加入到钥匙串中，然后在下一步的设置的第三步中就可以进行选择这些证书

`.mobileprovision` 是设备授权文件,双击后会安装到 `~/Library/MobileDevice/Provisioning Profiles`, `Library`中文就是叫`资源库`,所以路径可能是`~/资源库/MobileDevice/Provisioning Profiles`

### 1.4 Xcode项目配置
首先需要使用`xcode`打开项目，项目在 `工程目录/platforms/ios`这个目录下，点击这个目录下的 `＊.xcodeproj` 文件即可打开

如果打不开，那么可能是权限的问题，修改下项目的权限：

    $ sudo chmod -R 777 .    

打开项目后需要进行一些设置，下面的设置都是在Xcode中对这个项目的一些基本配置：

1. Xcode -> Preferences -> Locations -> Advanced -> Build Location 选择 Unique

2. 配置证书：

        Build Settings -> Code Signing -> Code Signing Identity

        Debug -> Iphone Developer:JIAN PING CHEN(J8QN6VCRN6)

        Any iOS SDK -> Iphone Developer:JIAN PING CHEN(J8QN6VCRN6)

        Release -> Iphone Distribution:JIAN PING CHEN(LNK896EWJB)

        Any iOS SDK -> Iphone Distribution:JIAN PING CHEN(LNK896EWJB)

这几个证书都是自己选择的，目前我们的项目是这样配置的，修改完了即可

3. 配置Provisioning Profile文件

        Build Settings -> Code Signing -> Code Signing Identity
        －> Provisioning Profile -> Automatic （这一步最好不要选择上面的pp文件，因为可能不匹配，选择Automatic的话会在打包过程中自动选择对应的pp文件，允许即可）

4. Build Settings -> Search Paths -> Header Search Paths -> Debug和Release都需要添加 `$(OBJROOT)/UninstalledProducts/$(PLATFORM_NAME)/include`

5. 配置应用处于background也可以接受推送

    Capabilities -> Background Modes(设置为on) －> 选中Modes下的Remote notifications

6. xcode项目根目录 -> Resources -> *-info.plist 设置 Localization native development region 为 `China`， 否则应用打开选择框的时候是英文的

然后就可以进行 `build` ， `Archive`等操作了


### 1.5 安装插件
插件的安装是没有顺序的，也就是随便先安装哪个都可以

首先，在`ionic`添加平台的时候，就会默认的添加下面的这几个插件：

    cordova-plugin-device
    cordova-plugin-console
    cordova-plugin-whitelist
    cordova-plugin-splashscreen
    ionic-plugin-keyboard
    cordova-plugin-statusbar
这几个插件可能都有用到，如果没有安装的话，那么自己手动安装下即可，安装命令都是一样的

    $ cordova plugin add <插件名称>

对于后来安装的插件在下面有列出来

1. 页面切换动画插件

    cordova plugin add https://github.com/Telerik-Verified-Plugins/NativePageTransitions#0.6.5

2. 热更插件

    cordova plugin add cordova-hot-code-push-plugin
还需要一个 `cordova-hot-code-push-cli`和他配套使用，这个东西的安装命令如下：

    $  npm install -g cordova-hot-code-push-cli
如果安装过程出错了，可以参看下面的插件配置中的`cordova-hot-code-push`安装步骤，若果安装成功，还需要进行一些配置，具体的都要看下面的详细配置
`cordova-hot-code-push-cli`需要先于`cordova-hot-code-push-plugin`安装

3. crosswalk（ios不要安装这个插件）

    $ ionic browser add crosswalk

4. app内部浏览器

    $ cordova plugin add cordova-plugin-inappbrowser

5. 微信支付插件

    $ cordova plugin add cordova-plugin-wechat  --variable wechatappid=YOUR_WECHAT_APPID

    测试服AppID: wxcc7cde19eee24e4b
    正式服AppID: wxed3426cf3b46da1e
    
这个插件最好下载到本地安装，因为在线速度特别慢,不过有VPN速度还是可以的

6. 极光推送插件

    $ cordova plugin add jpush-phonegap-plugin --variable API_KEY=your_jpush_appkey

    测试服API_KEY: 23a769eec0455ace104af863
    正式服API_KEY: a05e8d9db2cf847c97051ac3
    
7. Camera插件

    $ cordova plugin add cordova-plugin-camera
这个装上即可用

8. 网络检测插件

    $ cordova plugin add cordova-plugin-network-information --save
这个插件安装好了即可用，具体用法参考文档

`cordova`命令后面加`--save`可以将安装的插件保存到`config.xml`中

下面介绍下一些需要配置的插件的安装方法和在项目中的配置：

#### crosswalk(只在android平台安装)
为了更好的体验，打包的时候需要将`crosswalk`一起打包进去，虽然体积变大了，但是，体验有了极大的提升啊，尤其是`android`平台，对于各种适配真的是很麻烦。

下面是`android`平台的安装过程：

    $ ionic browser add crosswalk
基本上这个命令完了就可以了，等待安装好，想要移除的话最好是直接移除整个`android`平台，否则移除了`crosswalk`之后，`android`平台也不可以用了，而且有添加不了，很麻烦

现在`ios`平台还没有安装`crosswalk`...


#### ionic-native-transitions
**SKIP : SVN仓库中的代码已经对该插件进行了正常使用
这个插件主要用来优化页面之间的切换，可以实现页面间切换动画，使切换的更加流畅，可以使用在`android`和`ios`平台,详细的信息[参考地址](https://www.npmjs.com/package/ionic-native-transitions)

安装：

    $ sudo bower install shprink/ionic-native-transitions --allow-root

然后引入`ionic-native-transitions.min.js`文件：

    <script src="./PathToBowerLib/dist/ionic-native-transitions.min.js"></script>
这个引用如果已经有了则不需要再配置

还需要使用`ionic`安装原生的插件部分:

    # Using Cordova
    $ cordova plugin add https://github.com/Telerik-Verified-Plugins/NativePageTransitions#0.6.5

    # Using Ionic CLI
    $ ionic plugin add https://github.com/Telerik-Verified-Plugins/NativePageTransitions#0.6.5

在`android`平台中如果使用了`crosswalk`，并且 `crosswalk>1.3`，就需要在`config.xml`中加入下面的配置信息：

    <preference name="CrosswalkAnimatable" value="true" />

他的文档说在`ios9`以上的版本中需要加入 `cordova-plugin-wkwebview` 插件，亲测来看，这个插件最好不要装，因为会引起项目编译错误，应该是和其他的插件有冲突，
而且不安装也没发现什么问题

项目中的配置（下面的配置如果已经有了则不需要重复配置）：

1. 在 `index.html`中引入 `<script src="lib/ionic-native-transitions/dist/ionic-native-transitions.min.js"></script>`，这个东西的位置需要在`ionic.bundle.min.js` 文件的后面，否则会报错

2. 配置`angular`的第三方依赖，在 `app.module.js` 文件中加入 `ionic-native-transitions`, 代码形如下面：

        //第三方依赖
        angular.module('3rd-party', [
            'ab-base64',
            'ionic-citydata',
            'ionic-citypicker',
            'angularFileUpload',
            'jrCrop',
            'ionic-native-transitions'
        ]);


3. 配置页面切换的动画，需要配置的地方有`other/directives.js`，首先需要注入`$ionicNativeTransitions`,
所有出现`$ionicViewSwitcher.nextDirection`这类代码的地方需要替换:

    前进：

        $ionicViewSwitcher.nextDirection("forward");
        $state.go(ref.state, params, options);

        替换成

        $ionicViewSwitcher.nextDirection("forward");
        if($ionicNativeTransitions){
            $ionicNativeTransitions.stateGo(ref.state, params, options, {
                "type": "slide",
                "direction": "left", // 'left|right|up|down', default 'left' (which is like 'next')
                "duration": 300, // in milliseconds (ms), default 400
            });
        }else{
            $state.go(ref.state, params, options);
        }

    后退：

        $ionicViewSwitcher.nextDirection("back");
        $state.go($rootScope.historyBack, { stateParams: $rootScope.historyBackParams });

        替换成

        $ionicViewSwitcher.nextDirection("back");
        if($ionicNativeTransitions){
            $ionicNativeTransitions.stateGo($rootScope.historyBack, { stateParams: $rootScope.historyBackParams }, {}, {
                "type": "slide",
                "direction": "right", // 'left|right|up|down', default 'left' (which is like 'next')
                "duration": 300, // in milliseconds (ms), default 400
            });
        }else{
            $state.go($rootScope.historyBack, { stateParams: $rootScope.historyBackParams });
        }

由于`tab`切换的时候不需要 `slide` 动画，所以使用 `fade`，这样的话，需要在每次切换对应的路由的时候指定 `fade` 动画，目前需要使用`fade`的有
`tab.account`, `tab.home`, `tab.cart`, `tab.discovery`这四个路由，所以找到这四个路由文件加入

    nativeTransitions: {
        type: "fade"
    }
一个完整 `tab.home` 的`home.route.js`文件配置如下：

    angular
    .module('10Style.home')
    .config(function ($stateProvider) {
        $stateProvider
            .state('tab.home', {
                url: '^/home/:history&:stateParams',              //注意：修改匹配路径之后要修改loading.html文件。
                views: {
                    'tab-home': {
                        templateUrl: 'js/page/home/home.template.html',
                        controller: 'HomeCtrl'
                    }
                },
                nativeTransitions: {
                    type: "fade"
                }
            })
    });

其他的几个配置都是类似的，在对应的文件中加入上面的那个代码配置即可

#### cordova-plugin-statusbar
**SKIP : SVN仓库中的代码已经对该插件进行了正常使用
这个插件如果没有问题可以不用修改，因为默认就已安装好了，
具体查看[文档地址](https://github.com/apache/cordova-plugin-statusbar)，
这个插件用来控制状态栏，默认在添加平台的时候就已经安装好，如果有问题可以卸载后再安装：

    $ cordova plugin remove cordova-plugin-statusbar
    $ cordova plugin add https://github.com/apache/cordova-plugin-statusbar.git

在`index.html`引入`cordova.js`（如果已经配置，则不需要重复配置）：

    <script src="cordova.js"></script>
这个文件位置也需要在`ionic.bundle.min.js`的后面,这个文件是打包后自动生成的，所以直接这样引入即可

插件的安装过程很简单，安装好了之后就可以在全局中使用`window.StatusBar`，使用方法参见文档

#### cordova-hot-code-push
这是一个热更的插件，用处还是挺大的，起码不用反复让app上下架了。插件[github地址](https://github.com/nordnet/cordova-hot-code-push).
具体的内容可以查看`github`上面的[`wiki`](https://github.com/nordnet/cordova-hot-code-push/wiki)，内容很详细的介绍了这个插件的工作原理和配置说明

简单说下安装和配置：

1. 安装插件

        $ ionic plugin add cordova-hot-code-push-plugin

2. 安装本地开发插件(可以不用安装，实际上没什么用处)

        $ ionic plugin add cordova-hot-code-push-local-dev-addon
这个插件只有在本地开发的时候有用，发布的时候没什么用，其实可以不安装，因为真的没什么用处，而且发布的时候还要移除掉，很有可能忘记了...

3. 安装热更的本地客户端

        $ npm install -g cordova-hot-code-push-cli
这个插件就是重点了，很重要，因为我们要生成`chcp.json`和`chcp.manifest`这两个文件，手动不太靠谱，还是需要代码自动的。第一个文件是用来设置插件的一些配置信息，
第二个文件就是`www`目录下所有文件的文件的相对于`www`目录的地址和文件的`hash`值。如果不安装这个插件就需要自己写脚本生成了，其实也很容易，就是有个问题，
我自己写的生成的这两个文件在他的插件是不能使用，最后安装这个插件后就能自动更新下载了，一脸懵比，所以还是老实的安装了，不要自己搞事了...
那么在`windows`中安装这个插件也有一堆坑，首先需要有 `node.js`这个是一定的，其次还需要 `python2.x`，一定是`python2`的版本，否则还是会错，最后就是还需要`c++`编译,
这个就没办法了，最简单的办法就是安装`vs2015`，安装好了以后就可以顺利的安装啦！
安装好了这个插件只需要在项目更目录下运行命令：

        $ cordova-hcp build
这个时候就会在`www`目录下生成`chcp.json`和`chcp.manifest`这两个文件，如果有问题，在项目根目录下创建一个文件`cordova-hcp.json`，内容如下：

        {
            "autogenerated": true,
            "update": "now",
            "content_url": "http://app.yilinstyle.com",
            "min_native_interface": 1
        }
`content_url`填自己的热更内容存放的服务器地址即可，其他参数自己看文档，这个文件是作为一个模板文件，用于生成chcp.json,每次`cordova-hcp build`都会使用这个模板，需要修改的时候只需要修改这个文件即可

3. config.xml配置（如果已经配置，则不需要重复配置）

在`config.xml`文件中添加如下配置：

         <chcp>
            <config-file url="http://app.yilinstyle.com/chcp.json"/>
            <auto-download enabled="false" />
            <auto-install enabled="false" />
            <native-interface version="1" />
        </chcp>
`native-interface`中的值是指定的当前版本号，在更新之前会和`chcp.json`中的`min_native_interface`的值比较，如果`min_native_interface`比`native-interface`的值大，那么会无法更新并抛出一个异常，提示用户去下载新的版本。如果需要项目自动检查和安装更新，那么将`auto-download`和`auto-install`设置为`true`即可，那么在每次启动的时候就会检查并下载更新的内容，然后下次启动的时候会安装更新，再次启动才会看到更新，如果不想这么久用户才能看到更新，可以手动使用`js`控制，具体参考文档，不过有个问题就是在安装完成后页面会抖动一次，其实是因为安装完成后重新加载了一次页面
目前SVN仓库中的代码是自己通过代码来控制下载和安装热更内容

4. 权限（可选）

**SKIP : SVN仓库中的config.xml已经进行过配置
默认热更插件会把`www`目录复制在项目的目录下，如果想要复制到`sd卡`中吗，那么需要修改插件的源码，具体就不说了，那时候就需要添加对`sd卡`的读写权限和对文件夹的读写权限，在`config.xml`中的`android`标签中配置如下：

        <uses-permission name="android.permission.WRITE_EXTERNAL_STORAGE"/>
        <uses-permissio name="android.permission.MOUNT_UNMOUNT_FILESYSTEMS"/>

5. 修改
修改的时候可能没有权限，好吧，因为插件是后面安装的，所以权限还是root的，需要转换一下：

    $ sudo chmod -R 777 .

热更的插件原本检查是否需要更新的代码是直接进行字符串是否相等来判断的，这样就没法判断 `release` 的大小关系，现在需要只有在`release`的版本比较大的时候才进行更新，所以需要修改下原来的代码

在 `android`里面修改`project\platforms\android\src\com\nordnetab\chcp\main\updater\UpdateLoaderWorker.java#`这个文件中注释掉下面这段代码：

        // check if there is a new content version available
        if (newContentConfig.getReleaseVersion().equals(oldAppConfig.getContentConfig().getReleaseVersion())) {
            setNothingToUpdateResult(newAppConfig);
            return;
        }
然后添加：

        SimpleDateFormat sdf = new SimpleDateFormat("yyyy.MM.dd-HH.mm.ss");
        try {
            long newTmp = sdf.parse(newContentConfig.getReleaseVersion()).getTime();
            long oldTmp = sdf.parse(oldAppConfig.getContentConfig().getReleaseVersion()).getTime();
            if (newTmp<=oldTmp) {
                setNothingToUpdateResult(newAppConfig);
                return;
            }
        } catch (ParseException e) {
            e.printStackTrace();
            setNothingToUpdateResult(newAppConfig);
            return;
        }

最后在这个文件的顶部添加需要的`package`即可:

        import java.text.ParseException;
        import java.text.SimpleDateFormat;
        import java.util.Date;
        
这个代码就是先将`release`的字符串转换成时间戳，再对时间戳进行比较大小，如果新的配置文件时间戳比旧的文件时间戳要大才更新，否则不更新

在`ios`中，注释掉`project/platforms/ios/10时尚/Plugins/cordova-hot-code-push-plugin/Updater/HCPUpdateLoaderWorker.m`文件中：

        // check if new version is available
        if ([newAppConfig.contentConfig.releaseVersion isEqualToString:_oldAppConfig.contentConfig.releaseVersion]) {
            [self notifyNothingToUpdate:newAppConfig];
            return;
        }
然后添加：

        NSComparisonResult result = [newAppConfig.contentConfig.releaseVersion compare:_oldAppConfig.contentConfig.releaseVersion];
        if (result==NSOrderedAscending || result==NSOrderedSame) {
            [self notifyNothingToUpdate:newAppConfig];
            return;
        }

在`ios`中直接比较了`release`的字符串的大小，原理相同

上面添加的代码位置都需要添加在原来的代码位置，也就是注释的代码的位置，否则可能有问题

#### cordova-plugin-whitelist
**SKIP : SVN仓库中的config.xml已经对该插件进行过配置
这个是白名单插件，默认的情况下`ionic`禁止打开外部链接，也就是外部超链都是打不开的，所以可以设置一定的规则在白名单中，符合规则的就可以打开，启用应用也是这样

这个插件默认已经安装，如果没有安装就自己手动安装下，有安装修改配置即可

当前项目中`config.xml`的配置如下（如果已经配置，则不需要重复配置）:

        <allow-navigation href="*" />
        <allow-intent href="weixin:*" />
        <allow-intent href="alipays:*" />
        <access origin="*" />
如果有其他的需要，可以自己可以查看文档设置

#### cordova-plugin-splashscreen
**SKIP : SVN仓库中的config.xml已经对该插件进行过配置
这个插件用来设置应用启动的时候的启动页的动画，他可以控制启动页的图片显示和隐藏

这个插件也是默认安装的，如果没有手动安装下，有的话不用安装，直接修改配置即可：

        cordova plugin add cordova-plugin-splashscreen

在`config .xml`中设置如下（如果已经配置，则不需要重复配置）：

        <preference name="AutoHideSplashScreen" value="false" />
        <preference name="ShowSplashScreenSpinner" value="false"/>
        <preference name="FadeSplashScreenDuration" value="500"/>
        <preference name="SplashScreen" value="screen"/>

其他preferenceb标签中带有`Splash`的配置都删除掉


在项目的`app.js`文件中的`run`方法下添加隐藏启动页图片：

        ionic.Platform.ready(function () {
            ...

            if (window.navigator.splashscreen) {
                window.navigator.splashscreen.hide();
            }
            ...
        });
这段代码加在哪里根据需要，目前我们的项目中源码如下：

        ionic.Platform.ready(function () {
                _chcpInit();
                _jPushInit();

                var token = window.localStorage.getItem('token');
                if (token) {
                    authentication.refreshSignInStatus(function () {
                        window.location.href = location.href.split('#')[0]+'#/home/&';

                        if (window.navigator.splashscreen) {
                            $timeout(function(){
                                window.navigator.splashscreen.hide();
                            }, 300)
                        }
                    });
                }
                else {
                    window.location.href = location.href.split('#')[0]+'#/login';

                    if (window.navigator.splashscreen) {
                        window.navigator.splashscreen.hide();
                    }
                }
            });

大部分插件安装后即可使用，有些需要说明的插件都在上一节中有说明，用法可以看上面的`安装插件`的内容和插件的官方文档

## 2. ionic build android 
### 2.1 准备
首先得安装好sdk，jdk，下载好gradle，配置好环境变量

android-sdk：

    $ set ANDROID_HOME=sdk的安装位置
    $ set path=%PATH%;%ANDROID_HOME%\tools
    $ set path=%PATH%;%ANDROID_HOME%\build-tools\23.0.3

jdk:

    $ set JAVA_HOME=jdk的安装位置
    $ set path=%PATH%;%JAVA_HOME%\bin

gradle(这个可以不配置，后面说):

    $ set GRADLE_HOME=gradle安装的位置
    $ set path=%PATH%;%GRADLE_HOME%\bin

上面的手动配置在windows的环境变量中,也可以手动设置，我觉得手动设置更靠谱


### 2.2 build
如果你的环境配置正确应该就不会出现什么错误了，不然就根据错误提示去修改了。。。但是，这个时候一般会出现下载
`Downloading file:/E:/works/svn/client/platforms/android/gradle/wrapper/../gradle-2.2.1-all.zip`,这个时候会很慢，
所以可以先下载好然后放在 `myApp\platforms\android\gradle` 文件夹下，然后再命令行下设置 `CORDOVA_ANDROID_GRADLE_DISTRIBUTION_URL`：

    $ set CORDOVA_ANDROID_GRADLE_DISTRIBUTION_URL=../gradle-2.2.1-all.zip

上面这句每次启动新的cmd，就要设置一次。。。

**注意**：

`platforms\android\gradle` 这个目录刚生成的项目是没有的，需要先运行一次 `ionic build android` 这个命令，然后到下载的那一步停止即可，
再进行复制那一步，在进行上面的设置

都设置好后就可以`build`了,需要在项目根目录下：

    $ ionic build --release android

这样生成的apk如果不签名是不可以安装到手机上的，因为系统不允许安装，可以使用:

    $ ionic build android
生成一个debug版本，这样不签名就可以直接安装

### 2.3 生成apk签名所需密钥

    $ keytool -genkey -v -keystore my-release-key.keystore -alias alias_name -keyalg RSA -keysize 2048 -validity 10000

将生成的`my-release-key.keystore`文件复制到 `platforms\android\build\outputs\apk` 目录下

### 2.4 对apk进行签名
进入到apk生成的目录

    $ cd platforms\android\build\outputs\apk

进行签名：

    $ jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore my-release-key.keystore android-release-unsigned.apk alias_name

### 2.5 优化
最后运行android的优化命令，工具在 `/path/to/Android/sdk/build-tools/VERSION/zipalign`,也就是上面环境变量配置，如果上面环境变量配置正确，运行就不会有问题

    $ zipalign -v 4 android-release-unsigned.apk yilinstyle-v1.1.0-android.apk

最后那个参数是生成的apk的名称，可以随便写

### 2.6 adb logcat调试
    
    $ adb logcat *:S CHCP:D

### 2.7 插件安装
android中的插件和iOS中的基本相同，参考iOS插件安装和配置即可