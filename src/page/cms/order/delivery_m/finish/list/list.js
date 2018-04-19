// 已完成配送订单列表

import { Component } from 'vue-property-decorator';
import BaseVue from 'base.vue';

import { timeout } from 'common.env';

import { Card } from '../card/card';

import service from '../finish.service';

import './list.scss';
@Component({
    template: require('./list.html'),
    components: {
        'card-box': Card
    }
})
export class List extends BaseVue {

    list = [];

    activeItem = {};
    page = 0;
    limit = 10;
    _$service;

    cacheList = [];

    mounted() {

        this._$service = service(this.$store);

        this.$nextTick(() => {

            this.initPage();
        });

    }

    initPage() {

        this.today = this.getToday(new Date());

    }

    getToday(date, fmt = 'yyyy-MM-dd') {
        if (/(y+)/.test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
        }
        let o = {
            'M+': date.getMonth() + 1,
            'd+': date.getDate(),
            'h+': date.getHours(),
            'm+': date.getMinutes(),
            's+': date.getSeconds()
        };
        for (let k in o) {
            if (new RegExp(`(${k})`).test(fmt)) {
                let str = o[k] + '';
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? str : this.padLeftZero(str));
            }
        }
        return fmt;
    }

    padLeftZero(str) {
        return ('00' + str).substr(str.length);
    }

    queryList() {
        this.page = 0;
        this.cacheList = [];
        return this.queryNext();
    }

    async queryNext() {
        this.page++;
        let _result = (await this._$service.queryDeliveryOrderSucceedList({ page: this.page, limit: this.limit })).data;
        if (!_result || _result.errorCode || !_result.data) {
            return [];
        } else {
            this.cacheList.push(..._result.data);
            return this.cacheList;
        }
    }

    setList(datas, flag) {
        datas = this.pasreDatas(datas);

        // let newList = [];
        // for (let i = 0, len = datas.length; i < len; i++) {
        //     let _data = datas[i];
        //     let isExist = find(this.list, { combinOrderNo: _data.combinOrderNo });
        //     isExist || (newList.push(_data));
        // }
        // this.list[flag ? 'push' : 'unshift'](...newList);


        // if (flag) {
        //     this.list.push(...datas);
        // } else {
        this.list = datas;
        // }

        this.diffListContentOps();
    }

    pasreDatas(datas) {
        let result = [];
        let date = '';
        let time = '';
        let arr = [];
        let _finishTime = '';

        datas.sort((a, b)=>{
           return b.finishTime.replace(/\D/g, '') - a.finishTime.replace(/\D/g, '')
        });

        //a.sort((a, b)=> b-a)


        for (let i = 0, len = datas.length; i < len; i++) {
            let _data = datas[i];
            let _m = _data.finishTime.split(/\s+/);
            if (_m) {
                _data.time = _m[1];
                _finishTime = _m[0];
            } else {
                _data.time = '';
                _finishTime = '';
            }
            //
            if (_finishTime != date) {
                date = _finishTime;
                arr = [_data];
                result.push({
                    date: date,
                    today: date == this.today,
                    data: arr
                });
            } else {
                arr.push(_data);
            }
        }
        console.log(result);
        return result;
    }


    diffListContentOps() {
        timeout(() => {
            this.titleOps = [];
            let _contentRef = this.$refs.contentRef;
            if (!_contentRef) {
                return;
            }
            this.contentRef = _contentRef;
            let _renderTop = this.$refs.renderRef.offsetTop;
            for (let i = 0, len = _contentRef.length; i < len; i++) {
                let _dayDom = _contentRef[i];
                let _el = _dayDom.firstElementChild;
                let _tH = _el.offsetHeight;
                this.titleOps[i] = {
                    el: _el,
                    top: _dayDom.offsetTop - _renderTop,
                    index: i,
                    height: _tH + 10,
                    contentHeight: _dayDom.offsetHeight - _tH - 10,
                    countTop: 0
                };
            }
        }, 500);
    }

    // 下拉刷新
    refresh(done) {
        let _self = this;
        let _result = _self.queryList();

        setTimeout(() => {
            _result.then((datas) => {
                _self.setList(datas);
                done(true);
            });
        }, 500);

    }


    // 下拉加载 
    infinite(done) {
        let _self = this;
        let _result = _self.queryNext();

        setTimeout(() => {
            _result.then((datas) => {
                _self.setList(datas, true);
                done(true);
            });
        }, 500);

    }
    titleIndex = -1;
    prevTop = 0;
    currentTop = 0;
    monitoringMove(offset) {
        let _offsettop = offset.top;
        _offsettop = _offsettop > 0 ? Math.floor(_offsettop) : Math.ceil(_offsettop);
        this.prevTop = this.currentTop;
        this.currentTop = _offsettop;
        let _driftTop = this.currentTop - this.prevTop;
        let _result = null;;
        if (_driftTop < 0 || _driftTop > 0) {
            // 向上滚动 +
            //console.log('up');
            _result = this.diffTitleIndex(_offsettop);
            this.titleIndex = _result.index;
        }
        // else if (_driftTop > 0) {
        //     // 向下滚动 -
        //     //console.log('down');
        //     _result = this.diffTitleIndex(_offsettop);
        // } 
        else {
        }
    }

    diffTitleIndex(offsettop, upFlag) {
        let _result = { index: -1 };
        if (offsettop < 0) {
            return _result;
        }
        let _list = this.titleOps;
        // if (upFlag) {
        //     for (let i = _list.length - 1; i > -1; i--) {
        //         let _item = _list[i];
        //         if ((offsettop + _item.height) > _item.top) {
        //             _result = _item;
        //             break;
        //         }
        //     }
        // } else {
        for (let i = _list.length - 1; i > -1; i--) {
            let _item = _list[i];
            if (offsettop > _item.top) {
                _result = _item;
                break;
            }
        }
        //}
        return _result;
    }


}