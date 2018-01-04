


export default (_store) => {

    let _state = _store.state;
    let _http = _state.$http;

    //获取热门搜索
    let keywordhoturl =  'api/q_api_keyword';
    //获取关键词联想匹配
    let keywordlisturl =   'api/q_suggests';
    //获取搜索结果
    let goodslisturl =   'api/q_keyword';
    function q(url, data) {
        return _http({
            data: data,
            url: url,
            method: 'post'
        });
    }
    return {
        /**
         * 获取热门搜索
         */
        getKeyWord_hot() {
            return q(keywordhoturl)
        },
        /**
         * 获取关键词联想匹配
         * @param keyword
         */
        getKeyWord_list(keyword) {
            //test
            let data = {
                keyword: keyword
            }
            return q(keywordlisturl, data)
        },
        /**
         * 获取搜索结果
         * @param keyword
         */
        getGoods(keyword, page, limit) {
            let data = {
                keyword: keyword,
                page: page,
                limit: limit
            }
            return q(goodslisturl, data)
        },

        /**
         * 得到所有搜索历史
         */
        getAllHistory() {
            (localStorage.search_history_cms) || (localStorage.search_history_cms = "[]");
            return JSON.parse(localStorage.search_history_cms);
        },

        /**
         * 得到前n条搜索历史
         */
        getShowHistory(listMaxSize = 9) {
            return this.getAllHistory().slice(0, listMaxSize);
        },

        /**
         * 设置一条搜索历史 所有历史最多99条
         * @param word
         */
        setHistory(word, listMaxSize = 99) {
            if (word instanceof Array) {
                word.length > 99 && word.pop();
                localStorage.search_history_cms = JSON.stringify(word);
            } else {
                //关键词最长20个字符
                word = word.substring(0, 20);
                //判断当前缓存是否有此关键词
                var list = this.getAllHistory(),
                    index = list.indexOf(word);
                if (index != -1) {
                    list.splice(index, 1);
                }
                list.unshift(word);
                this.setHistory(list);
            }
        },

        /**
         * 删除一条/所有搜索历史
         * @param e
         */
        delHistory(e) {
            if (e.nodeName === "I") {
                var list = this.getAllHistory(),
                    index = list.indexOf(e.parentNode.innerText);
                list.splice(index, 1);
                this.setHistory(list);
                return false;
            } else {
                //弹窗确认清空操作
                return new Promise((res, rej) => {
                    let dialogObj = {
                        title: '清除浏览历史',
                        content: '您正在清除浏览历史记录,不可回退！',
                        type: 'info',
                        assistBtn: '取消',
                        mainBtn: '确认',
                        assistFn() {
                            res(false);
                        },
                        mainFn() {
                            localStorage.search_history_cms = JSON.stringify([]);
                            res(true);
                        }
                    };
                    _state.$dialog({ dialogObj });
                });
            }
        },
        getDiscountPrice(data) {
            return q("api/wd_vip/q_disc_goods", data);
        },
    }
}
