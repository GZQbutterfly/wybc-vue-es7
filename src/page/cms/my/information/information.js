// 资讯
import { Component } from 'vue-property-decorator';
import BaseVue from 'base.vue';
import Swiper from 'swiper';
import informationService from './information.service';
import { isCMS } from 'common.env';

import './information.scss';
@Component({
    template: require('./information.html'),
})

export class Information extends BaseVue {
    _$service;
    swiper;
    isInit = true;
    //所有资讯数据
    dataList = [];
    //当前显示的分类下标
    showIndex = 0;
    //分类每一页显示的数据条数
    limit = 10;
    //正在下拉刷新 不允许再次
    isRefreshing = false;
    //端
    channel = 'wd';

    mounted() {
        let _self = this;
        _self._$service = informationService(_self.$store);
        isCMS() &&　(_self.channel = 'store');
        _self.$nextTick(() => {
            _self.initSwiper();
            _self.queryAllTypeOfInformation();
        });
    }

    //初始化swiper
    initSwiper() {
        let _self = this;
        _self.swiper = new Swiper(_self.$refs.informationSwiper, {
            slidesPerGroup: 1,
            slidesPerView: 4.5,
            observer: true,
            on: {
                transitionEnd() {
                    if (_self.isInit) {
                        this.slideTo(_self.showIndex);
                        _self.isInit = false;
                    }
                }
            }
        });
    }

    /**
     * 查询资讯的所有分类
     */
    async queryAllTypeOfInformation() {
        let _self = this;
        let query = {
            channel: _self.channel
        }
        let _res = await _self._$service.queryAllTypeOfInformation(query);
        if (!_res.data.errorCode) {
            _res.data.data.forEach(function (ele) {
                _self.dataList.push(Object.assign({}, { data: [], page: 1 }, ele));
            }, this);
        }
    }

    //切换分类
    changeType(index) {
        let _self = this;
        if (index == _self.showIndex) {
            return;
        }
        _self.showIndex = index;
        _self.swiper.slideTo(index);
    }

    //加载当前id下的资讯
    loadInformation() {
        let _self = this;
        let _item = _self.dataList[_self.showIndex];
        let query = {
            platform: 'webAPP',
            channel: _self.channel,
            frequencyId: _item.id,
            page: _item.page,
            limit: _self.limit,
        };
        return _self._$service.queryOnePageOfInformation(query);
        
    }

    //处理上拉下拉得到的数据
    setInformationData(_res,done,isRefresh){
        let _self = this;
        let _item = _self.dataList[_self.showIndex];
        if (_res.data.errorCode) {
            if (isRefresh) {
                _item.data = [];
            }
        } else {
            _res.data.data.forEach((news) => {
                news.cover = JSON.parse(news.cover);
            })
            if (isRefresh) {
                _item.data = _res.data.data;
            } else {
                _item.data.push(..._res.data.data);
            }
            if (_item.data.length < _self.limit) {
                _item.page = -1;
            } else {
                _item.page++;
            }
        }
        done(true);
        isRefresh && (_self.isRefreshing = false);
    }

    //下拉刷新
    refresh(done) {
        let _self = this;
        if(_self.isRefreshing){
            done(true);
        }else{
            _self.isRefreshing = true;
            let _item = _self.dataList[_self.showIndex];
            _item.page = 1;
            let _res = _self.loadInformation();
            setTimeout(() => {
                _res.then((res) => {
                    _self.setInformationData(res,done,true);
                })
            }, 300);
        }
    }

    //上拉加载
    infinite(done) {
        let _self = this;
        let _item = _self.dataList[_self.showIndex];
        if (_item.page == -1) {
            done(true);
            return;
        }
        let _res = _self.loadInformation();
        setTimeout(() => {
            _res.then((res) => {
                _self.setInformationData(res,done,false);
            })
        }, 300)
    }

    //点击资讯跳转到详情
    goNewsDetail(url, id) {
        location.href = url + '?contentId=' + id;
    }

}
