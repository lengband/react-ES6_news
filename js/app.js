var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
// 解构React对象以及ReactDOM对象
var Component = React.Component;
var render = ReactDOM.render;
//定义工具对象，实现异步请求方法
var Util = {
    ajax: function (url, fn) {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    var res = JSON.parse(xhr.responseText);
                    fn && fn(res);
                }
            }
        };
        xhr.open("GET", url, true);
        xhr.send(null);
    },
    /**
     * 对象转化成query
     * @obj 	转化的对象
     * return 	query数据
     * eg: {color: "red", title: 'ickt'} => ?color=red&title=ickt
     **/
    objToQuery: function (obj) {
        var result = '';
        for (var i in obj) {
            // key是i， value是obj[i]
            result += '&' + i + '=' + obj[i];
        }
        // 删除第一个&符号，添加?
        return '?' + result.slice(1);
    }
};
// 三个页面有三个组件，创建出来
// 首页
var Home = (function (_super) {
    __extends(Home, _super);
    function Home() {
        _super.apply(this, arguments);
    }
    Home.prototype.clickItem = function (id) {
        //console.log(this) //window
        this.props.showDetail(id);
    };
    Home.prototype.createView = function () {
        var _this = this;
        return this.props.data.map(function (obj, index) {
            return (React.createElement("li", {"key": index, "onClick": _this.clickItem.bind(_this, obj.id), "className": "clearfix"}, React.createElement("img", {"src": obj.img, "alt": ""}), React.createElement("div", {"className": "content"}, React.createElement("h2", null, obj.title), React.createElement("p", null, obj.content, React.createElement("span", {"className": "home-comment"}, "评论:" + obj.comment)))));
        });
    };
    // 渲染虚拟DOM
    Home.prototype.render = function () {
        return (React.createElement("ul", {"className": "home"}, this.createView()));
    };
    return Home;
})(Component);
// 详情页
var Detail = (function (_super) {
    __extends(Detail, _super);
    function Detail() {
        _super.apply(this, arguments);
    }
    // 渲染输出虚拟DOM
    Detail.prototype.render = function () {
        // console.log(111111111111)
        var _a = this.props.data, title = _a.title, time = _a.time, comment = _a.comment, img = _a.img, content = _a.content, id = _a.id;
        // 定义内容
        var contentText = {
            __html: content
        };
        return (React.createElement("div", {"className": "detail"}, React.createElement("h2", null, title), React.createElement("div", {"className": "detail-state"}, React.createElement("span", null, time), React.createElement("span", {"className": "right"}, '评论：' + comment)), React.createElement("img", {"src": img, "alt": ""}), React.createElement("p", {"className": "content", "dangerouslySetInnerHTML": contentText}), React.createElement("div", {"className": "show-comment", "onClick": this.showMoreComment.bind(this, id)}, "查看更多评论")));
    };
    Detail.prototype.showMoreComment = function (id) {
        //通过子组件将id传给父组件在传给评论组件渲染对应id的评论
        this.props.showComment(id);
    };
    return Detail;
})(Component);
// 评论页
var Comment = (function (_super) {
    __extends(Comment, _super);
    function Comment(props) {
        _super.call(this, props);
        this.state = {
            list: props.data.list || [],
            id: props.data.id || ""
        };
    }
    Comment.prototype.componentWillReceiveProps = function (props) {
        this.setState({
            // 用属性数据，更新状态数据
            list: props.data.list || [],
            text: ""
        });
    };
    Comment.prototype.createView = function () {
        return this.state.list.map(function (obj, index) {
            return (React.createElement("li", {"key": index}, React.createElement("h3", null, obj.user), React.createElement("p", null, obj.content), React.createElement("span", null, obj.time)));
        });
    };
    // 渲染输出虚拟DOM
    Comment.prototype.render = function () {
        // console.log(this.props)  //为什么刚开始会进来两次
        return (React.createElement("div", {"className": "comment"}, React.createElement("div", {"className": "comment-input"}, React.createElement("textarea", {"placeholder": "文明上网，理性发言！", "onChange": this.changeText.bind(this), "value": this.state.text, "ref": "inputText"})), React.createElement("div", {"className": "submit-btn", "onClick": this.submibtInput.bind(this)}, "提交"), React.createElement("ul", null, this.createView())));
    };
    Comment.prototype.changeText = function (value) {
        this.setState({
            text: value.target.value
        });
    };
    Comment.prototype.submibtInput = function () {
        var _this = this;
        var val = this.refs.inputText.value;
        if (/^\s*$/.test(val)) {
            alert("请您输入内容！");
            return;
        }
        else if (val.indexOf("傻") >= 0) {
            alert("请文明用语");
            return;
        }
        // 4 拼凑提交的数据
        var date = new Date();
        var result = {
            user: '冷板凳',
            content: val,
            // "昨天 22:38:28"
            time: '刚刚: ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds()
        };
        // data/addComment.json
        Util.ajax("data/addComment.json" + Util.objToQuery(result), function (res) {
            if (res && res.errno === 0) {
                // 要为list后面添加新的提交数据
                var list = _this.state.list;
                list.unshift(result);
                _this.setState({
                    list: list
                });
                // 7 输入内容清空
                _this.refs.inputText.value = '';
                alert('恭喜您，提交成功！');
            }
        });
    };
    return Comment;
})(Component);
//定义头部
var Header = (function (_super) {
    __extends(Header, _super);
    function Header() {
        _super.apply(this, arguments);
    }
    //通过这种方式执行到父组件的回调函数的话,父组件的作用域就是子组件的属性对象了
    /*goBack1 () {
        this.props.goBack()
    }*/
    Header.prototype.render = function () {
        return (React.createElement("div", {"className": "header"}, React.createElement("div", {"className": "go-back", "onClick": this.props.goBack}, React.createElement("span", {"className": "arrow"}), React.createElement("span", {"className": "arrow blue"})), React.createElement("div", {"className": "login"}, "登录"), React.createElement("h1", {"className": "title"}, "快讯资讯")));
    };
    return Header;
})(Component);
// 创建一个组件，渲染到页面中
var App = (function (_super) {
    __extends(App, _super);
    //构造函数
    function App(props) {
        //ES6中不支持getDefaultProps和getInitialState方法,所以不能再这里定义
        _super.call(this);
        this.state = {
            section: props.section,
            list: [],
            detail: {},
            comment: {}
        };
    }
    App.prototype.showDetail = function (id) {
        var _this = this;
        // console.log(this)
        Util.ajax("data/detail.json?id=" + id, function (res) {
            if (res && res.errno === 0) {
                _this.setState({
                    detail: res.data,
                    section: "detail"
                });
            }
        });
    };
    App.prototype.goBack = function () {
        switch (this.state.section) {
            case 'home':
                break;
            case 'detail':
                this.setState({ section: "home" });
                break;
            case 'comment':
                this.setState({ section: "detail" });
                break;
        }
    };
    // 通过render方法渲染输出虚拟dom
    App.prototype.render = function () {
        var _a = this.state, section = _a.section, list = _a.list, detail = _a.detail, comment = _a.comment;
        return (React.createElement("div", null, React.createElement(Header, {"goBack": this.goBack.bind(this)}), React.createElement("div", {"style": { display: section === "home" ? "block" : "none" }}, React.createElement(Home, {"data": list, "showDetail": this.showDetail.bind(this)}), "}"), React.createElement("div", {"style": { display: section === "detail" ? "block" : "none" }}, React.createElement(Detail, {"data": detail, "showComment": this.showComment.bind(this)})), React.createElement("div", {"style": { display: section === "comment" ? "block" : "none" }}, React.createElement(Comment, {"data": comment}))));
    };
    //由detail组件通知父组件更新状态给comment组件
    App.prototype.showComment = function (id) {
        var _this = this;
        //如果不用bind改变这里的this,那么这里的this讲指向detail的属性实例化对象
        Util.ajax("data/comment.json?id=" + id, function (res) {
            //因为箭头函数的作用域是定义时的作用域,所以在这里是App组件实例化对象
            if (res && res.errno === 0) {
                _this.setState({
                    comment: res.data,
                    section: "comment"
                });
            }
        });
    };
    App.prototype.componentDidMount = function () {
        var _this = this;
        Util.ajax("data/list.json", function (res) {
            _this.setState({
                list: res.data
            });
        });
    };
    return App;
})(Component);
// 渲染到页面中
render(React.createElement(App, {"section": "home"}), document.getElementById("app"));
