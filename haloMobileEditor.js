/**
 * 移动端富文本编辑器
 * @author xjfhnsd@163.com
 * @url   https://github.com/HaloStudio/artEditor
 */
$.fn.extend({
    _opt: {
        placeholder: '<p>请输入内容</p>',
        validHtml: [],
        limitSize: 3,
        showServer: false
    },
    haloMobileEditor: function(options) {
        var _this = this,
            styles = {
                "-webkit-user-select": "auto",
                "user-select": "auto",
                "overflow-y": "auto",
                "text-break": "break-all",
                "outline": "none"
            };
        $(this).css(styles).attr("contenteditable", true);
        _this._opt = $.extend(_this._opt, options);
        try{
            $(_this._opt.imgTar).on('change', function(e) {
                var file  = e.target.files[0];
                if(Math.ceil(file.size/1024/1024) > _this._opt.limitSize) {
                    console.error('文件太大');
                    return;
                }
                var reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = function (f) {
                    if(_this._opt.showServer) {
                        _this.upload(f.target.result);
                        return ;
                    }
                    var img = '<img src="'+ f.target.result +'" style="width:90%;" />';
                    _this.insertImage(img);
                };
            });
            _this.placeholderHandler();
            _this.pasteHandler();
        } catch(e) {
            console.log(e);
        }
    },
    upload: function(data) {
        var _this = this, field = _this._opt.uploadField;
        var postData = $.extend(_this._opt.data, {field: data});
        console.log(_this._opt.contentType, _this._opt.headers, postData);
        $.ajax({
                url: _this._opt.uploadUrl,
                type: 'post',
                contentType: _this._opt.contentType || 'application/x-www-form-urlencoded',
                headers: _this._opt.headers || {},
                data: _this._opt.contentType === 'application/json'?JSON.stringify(postData):postData,
                cache: false
            })
            .then(function(res) {
                var src = _this._opt.uploadSuccess(res);
                if(src) {
                    var img = '<img src="'+ src +'" style="width:90%;" />';
                    _this.insertImage(img);
                } else {
                    _this._opt.uploadError(res);
                }
            });
    },
    insertImage: function(src) {
        $(this).focus();
        var selection = window.getSelection ? window.getSelection() : document.selection;
        var range = selection.createRange ? selection.createRange() : selection.getRangeAt(0);
        if (!window.getSelection) {
            range.pasteHTML(src);
            range.collapse(false);
            range.select();
        } else if(selection) {
            range.collapse(false);
            var hasR = range.createContextualFragment(src);
            var hasLastChild = hasR.lastChild;
            while (hasLastChild && hasLastChild.nodeName.toLowerCase() == "br" && hasLastChild.previousSibling && hasLastChild.previousSibling.nodeName.toLowerCase() == "br") {
                var e = hasLastChild;
                hasLastChild = hasLastChild.previousSibling;
                hasR.removeChild(e);
            }
            range.insertNode(range.createContextualFragment("<br/>"));
            range.insertNode(hasR);
            if (hasLastChild) {
                range.setEndAfter(hasLastChild);
                range.setStartAfter(hasLastChild);
            }
            selection.removeAllRanges();
            selection.addRange(range);
        }
        else{
            $(this).append('<br/>' + src);
        }
    },
    pasteHandler: function() {
        var _this = this;
        $(this).on("paste", function() {
            /*var content = $(this).html();
             valiHTML = _this._opt.validHtml;
             content = content.replace(/_moz_dirty=""/gi, "").replace(/\[/g, "[[-").replace(/\]/g, "-]]").replace(/<\/ ?tr[^>]*>/gi, "[br]").replace(/<\/ ?td[^>]*>/gi, "&nbsp;&nbsp;").replace(/<(ul|dl|ol)[^>]*>/gi, "[br]").replace(/<(li|dd)[^>]*>/gi, "[br]").replace(/<p [^>]*>/gi, "[br]").replace(new RegExp("<(/?(?:" + valiHTML.join("|") + ")[^>]*)>", "gi"), "[$1]").replace(new RegExp('<span([^>]*class="?at"?[^>]*)>', "gi"), "[span$1]").replace(/<[^>]*>/g, "").replace(/\[\[\-/g, "[").replace(/\-\]\]/g, "]").replace(new RegExp("\\[(/?(?:" + valiHTML.join("|") + "|img|span)[^\\]]*)\\]", "gi"), "<$1>");
             if (!/firefox/.test(navigator.userAgent.toLowerCase())) {
             content = content.replace(/\r?\n/gi, "<br>");
             }
             $(this).html(content);*/
        });
    },
    placeholderHandler: function() {
        var _this = this;
        $(this).on('click', function(){
                _this.focus();
            })
            .on('focus', function() {
                window.haloEditorSelection = null;
                _this.startBuffer.apply(_this,[]);
                if($.trim($(this).html()) === _this._opt.placeholder) {
                    $(this).html('');
                }
            })
            .on('blur', function() {
                _this.stopBuffer.apply(_this,[]);
                if(!$(this).html()) {
                    $(this).html(_this._opt.placeholder);

                    if(_this._opt.hook){
                        $(_this._opt.hook).val('');
                    }
                }
                else{
                    if(_this._opt.hook){
                        $(_this._opt.hook).val($(this).html());
                    }
                }
            });

        if(!$.trim($(this).html())) {
            $(this).html(_this._opt.placeholder);
        }
    },
    getValue: function() {
        return $(this).html();
    },
    setValue: function(str) {
        $(this).html(str);

        //deal with hook textarea or input hidden
        if(this._opt.hook){
            $(this._opt.hook).val(str);
        }
    },
    startBuffer:function () {
        console.log('start buffer ', this.haloEditorBufferring);
        window.haloEditorBufferring = true;
        this.selectionBuffer();
    },
    stopBuffer:function () {
        console.log('stop buffer ', this.haloEditorBufferring);
        window.haloEditorBufferring = false;
    },
    selectionBuffer:function(){
        if(!/Mobile/.test(navigator.userAgent))
            return;

        if(!window.haloEditorBufferring) return;

        var _this = this;

        var selection = window.getSelection?window.getSelection():document.getSelection();
        if (!selection){
            setTimeout(function(){
                _this.selectionBuffer.apply(_this, []);
            }, 100);
            return;
        }
        if (selection.isCollapsed) {
            setTimeout(function(){
                _this.selectionBuffer.apply(_this, []);
            }, 100);
            return;
        }
        var rangeCount = selection.rangeCount;
        if (rangeCount == 0) {
            setTimeout(function(){
                _this.selectionBuffer.apply(_this, []);
            }, 100);
            return;
        }
        var posS = selection.anchorOffset;
        var posE = selection.focusOffset;
        var anchorNode = selection.anchorNode;
        var focusNode = selection.focusNode;
        var p = anchorNode;
        console.log('anchor node', anchorNode, anchorNode.parentNode);
        if (anchorNode.nodeType == 3 &&
            anchorNode.parentNode.textContent == anchorNode.textContent) {
            p = anchorNode.parentNode;
            //anchorNode = anchorNode.parentNode;
            console.log('anchor p', p);
        }
        if (focusNode.nodeType == 3 &&
            focusNode.parentNode.textContent == focusNode.textContent) {
            p = focusNode.parentNode;
            //focusNode = focusNode.parentNode;
            console.log('focus p', p);
        }

        while($(p).has(anchorNode).length == 0 || $(p).has(focusNode).length == 0){
            p = p.parentNode;
        }

        window.haloEditorSelection = [p, posS, anchorNode, posE, focusNode];
        $(_this._opt.hook).val(JSON.stringify(window.haloEditorSelection));
        setTimeout(function(){
            _this.selectionBuffer.apply(_this, []);
        }, 100);
    },
    haloMobileEditorAction:function(action, val) {
        if(action == 'image'){
            if(this._opt.imgTar){
                $(this._opt.imgTar).trigger('click');
            }
            return;
        }
        var p, posS, posE, selection, anchorNode, focusNode;

        if(/Mobile/.test(navigator.userAgent) && window.haloEditorSelection){
            var arr = window.haloEditorSelection;
            p = arr[0];
            posS = arr[1];
            anchorNode = arr[2];
            posE = arr[3];
            focusNode = arr[4];
        }
        else {
            selection = window.getSelection ? window.getSelection() : document.getSelection();
            if (!selection) return;
            if (selection.isCollapsed) return;
            var rangeCount = selection.rangeCount;
            if (rangeCount == 0) return;
            posS = selection.anchorOffset;
            posE = selection.focusOffset;
            anchorNode = selection.anchorNode;
            focusNode = selection.focusNode;
            p = anchorNode;
            if (anchorNode.nodeType == 3 &&
                anchorNode.parentNode.textContent == anchorNode.textContent) {
                p = anchorNode.parentNode;
                //anchorNode = anchorNode.parentNode;
                console.log('anchor p', p);
            }
            if (focusNode.nodeType == 3 &&
                focusNode.parentNode.textContent == focusNode.textContent) {
                p = focusNode.parentNode;
                //focusNode = focusNode.parentNode;
                console.log('focus p', p);
            }

            while($(p).has(anchorNode).length == 0 || $(p).has(focusNode).length == 0){
                p = p.parentNode;
            }
        }

        var list = p.childNodes;
        var isStart = false;
        var isEnd = false;
        // var range = selection.getRangeAt(0);
        var selectedNodes = [];

        /**
         *
         * @param curNode
         * @param action
         * @param val
         * @param nodePos 0 中间, 1 首, 9 尾, 10 唯一
         * @param sort 0 前->后, 1 后->前
         */
        function innerDealNode(curNode, action, val, nodePos, sort){
            console.log(curNode, nodePos, sort, posS, posE);
            //先处理掉textNode
            if (curNode.nodeType == 3) {
                console.log('text node found', curNode);
                var span = document.createElement('span');
                span.innerHTML = curNode.textContent;
                curNode.parentNode.insertBefore(span, curNode);
                curNode.parentNode.removeChild(curNode);
                curNode = span;
            }
            var s = 0;
            var e = 0;
            if(nodePos == 10){
                s = Math.min(posE, posS);
                e = Math.max(posE, posS);
                console.log('start & end', s, e);
                var txt = curNode.textContent;
                if(s!=0 || e != curNode.textContent.length){
                    //要截取子串
                    var str = txt.substr(s, e-s);
                    curNode.innerHTML = txt.slice(0, s) + '<span>' +
                        str + '</span>' + txt.slice(e);

                    curNode = curNode.childNodes[1];
                    //选定当前选区
                    //range.selectNode(curNode);
                    //selection.selectAllChildren(curNode);
                }
            }
            if(sort == 1){
                //后向前的

                //第1个节点
                if(nodePos == 9){
                    s = 0;
                    e = posS;
                    console.log('start & end', s, e);
                    var txt = curNode.textContent;
                    var str = txt.substr(s, e-s);
                    curNode.innerHTML = '<span>' +
                        str + '</span>' + txt.slice(e);

                    curNode = curNode.childNodes[0];
                    //选定当前选区
                    //range.selectNode(curNode);
                    // selection.selectAllChildren(curNode);
                }
                else if(nodePos == 1){
                    var txt = curNode.textContent;
                    s = posE;
                    e = txt.length;
                    console.log('start & end', s, e);
                    var str = txt.substr(s, e-s);
                    curNode.innerHTML = txt.slice(0, s) + '<span>' +
                        str + '</span>';

                    curNode = curNode.childNodes.length==1?curNode.childNodes[0]:curNode.childNodes[1];
                    //选定当前选区
                    //range.selectNode(curNode);
                    // selection.selectAllChildren(curNode);
                }
            }
            if(sort == 0){
                //前向后的

                //末尾节点
                if(nodePos == 9){
                    s = 0;
                    e = posE;
                    console.log('start & end', s, e);
                    var txt = curNode.textContent;
                    var str = txt.substr(s, e-s);
                    curNode.innerHTML = '<span>' +
                        str + '</span>' + txt.slice(e);

                    curNode = curNode.childNodes[0];
                    //选定当前选区
                    //range.selectNode(curNode);
                    //selection.selectAllChildren(curNode);
                }
                else if(nodePos == 1){
                    var txt = curNode.textContent;
                    s = posS;
                    e = txt.length;
                    console.log('start & end', s, e);
                    var str = txt.substr(s, e-s);
                    curNode.innerHTML = txt.slice(0, s) + '<span>' +
                        str + '</span>';
                    curNode = curNode.childNodes.length==1?curNode.childNodes[0]:curNode.childNodes[1];
                    //选定当前选区
                    //range.selectNode(curNode);
                    //selection.selectAllChildren(curNode);
                }
            }

            //处理中间节点
            switch (action) {
                case 'italic':
                    curNode.style.fontStyle =
                        curNode.style.fontStyle == 'italic' ? 'normal' : 'italic';
                    break;
                case 'bold':
                    curNode.style.fontWeight =
                        curNode.style.fontWeight == 'bold' ? 'normal' : 'bold';
                    break;
                case 'underline':
                    curNode.style.textDecoration =
                        curNode.style.textDecoration == 'underline' ? '' : 'underline';
                    break;
                case 'fontSize':
                    curNode.style.fontSize = val||'1.0em';
                    break;
                case 'color':
                    curNode.style.color = val||'';
                    break;
            }
            selectedNodes.push(curNode);
        }

        function reSelect(){
            //重新选中选区
            if(selectedNodes.length == 1){
                selection.selectAllChildren(selectedNodes[0]);
            }
        }

        var _sort = 0;//前->后
        var _sorted = false;
        for (var i = 0; i < list.length; i++) {
            var curNode = list[i];

            if (curNode.textContent == anchorNode.textContent
                || curNode.textContent == focusNode.textContent
                || $(curNode).has(anchorNode).length > 0 || $(curNode).has(focusNode).length > 0) {
                if (isStart) {
                    isEnd = true;
                    if($(curNode).has(focusNode).length > 0 && curNode.textContent != focusNode.textContent){
                        curNode = focusNode;
                    }
                    else if($(curNode).has(anchorNode).length > 0 && curNode.textContent != anchorNode.textContent){
                        curNode = anchorNode;
                    }
                    //即时处理最后一个节点
                    innerDealNode(curNode, action, val, 9, _sort);
                    reSelect();
                    return;
                }

                isStart = true;
                if((curNode.textContent == focusNode.textContent || $(curNode).has(focusNode).length > 0)
                    && !_sorted){
                    _sort = 1; //后->前
                    _sorted = true;
                    if($(curNode).has(focusNode).length > 0 && curNode.textContent != focusNode.textContent){
                        curNode = focusNode;
                    }
                }
                if((curNode.textContent == anchorNode.textContent || $(curNode).has(anchorNode).length > 0)
                    && !_sorted){
                    _sort = 0; //前->后
                    _sorted = true;
                    if($(curNode).has(anchorNode).length > 0 && curNode.textContent != anchorNode.textContent){
                        curNode = anchorNode;
                    }
                }
                //处理一下第一个节点
                if(anchorNode == focusNode) {
                    innerDealNode(anchorNode, action, val, 10, _sort);
                    reSelect();
                    return;
                }

                innerDealNode(curNode, action, val, 1, _sort);
                continue;
            }
            if (!isStart) continue;

            //处理中间节点
            innerDealNode(curNode, action, val, 0, _sort);
        }
    }
});
