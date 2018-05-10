import { Component } from 'vue-property-decorator';
import BaseVue from 'base.vue';
import followService from './follow_shop.service';
import { isNotLogin, toLogin } from 'common.env';
import { isEmpty } from 'lodash';

import './follow_shop.scss';


@Component({
    template: require('./follow_shop.html')
})
export class FollowShop extends BaseVue {
    _$service;
    wdList=[];
    page = 0;
    isEmpty = false;
    mounted () {
        document.title="关注店铺";
        this._$service = followService(this.$store);
    }
    loadDatas(page, isFirst = true, cb){
        let data={
            limit:10,
            page: page,
        }
       this.page = page;
        this._$service.queryMyAttentionWdLists(data).then(res=>{
            if (isFirst){
                if (!res.data.errorCode && res.data.wdList && res.data.wdList.length != 0) {
                    res.data.wdList.forEach(item => {
                        item.isFollow = true;
                        item.followName = "已关注";
                    })
                    this.wdList = res.data.wdList;
                    cb && cb(false);
                }else{
                    this.isEmpty = true;
                    cb && cb(true);
                }   
            }else{
                if (!res.data.errorCode && res.data.wdList && res.data.wdList.length != 0) {
                    res.data.wdList.forEach(item => {
                        item.isFollow = true;
                        item.followName = "已关注";
                    })
                    this.wdList = this.wdList.concat(res.data.wdList);
                    cb && cb(false);
                }else{
                    cb && cb(true); 
                }  
            }
           
        });
    }
    followShop(item,i){
        if (item.isFollow) {
            let dialog = this.$store.state.$dialog;
            let _self = this;
            let dialogObj = {
                title: '提示',
                content: '是否取消关注' + item.wdName +'?',
                assistBtn: '取消',
                mainBtn: '确定',
                type: 'info',
                assistFn() { },
                mainFn() {
                    _self.$store.dispatch('CANCEL_FOLLOW_SHOP', { shopId: item.infoId }).then(flag => {
                        _self.wdList[i].isFollow = flag;
                        if (flag) {
                            _self.wdList[i].followName = "已关注";
                        } else {
                            _self.wdList[i].followName = "关注";
                        }
                    });
                }
            };
            dialog({ dialogObj });
        } else {
            this.$store.dispatch('ADD_FOLLOW_SHOP', { shopId: item.infoId }).then(flag => {
                this.wdList[i].isFollow = flag;
                if (!flag) {
                    this.wdList[i].followName = "关注";
                } else {
                    this.wdList[i].followName = "已关注";
                }
            });
        }  
    }
    refresh(done){
        this.page = 1;
        setTimeout(() => {
            this.loadDatas(1, true, done );
        }, 300);
    }
    infinite(done){
        setTimeout(() => {
            if(this.page==0){
                this.loadDatas(this.page + 1, true,done);
            }else{
                this.loadDatas(this.page + 1,false, done);
            }
          
        }, 300);
    }

    goHome(item){
        let dialog = this.$store.state.$dialog;
        let _self = this;
        let dialogObj = {
            title: '提示',
            content: '您确认要切换店铺到' + item.wdName + '?',
            assistBtn: '取消',
            mainBtn: '确定',
            type: 'info',
            assistFn() { },
            mainFn() {
                _self.$router.push({ path: "home", query: { shopId: item.infoId } });
            }
        };
        dialog({ dialogObj });
      
    }
}