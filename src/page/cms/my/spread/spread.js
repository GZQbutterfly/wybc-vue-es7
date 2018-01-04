// 我要推广
import { Component } from 'vue-property-decorator';
import BaseVue  from 'base.vue';
import { getLocalUserInfo, pageNotAccess, timeout } from 'common.env';

import service from './spread.service';

import './spread.scss';
@Component({
    template: require('./spread.html')
})
export class MySpread extends BaseVue {

    headimgurl = '';
    username = ''
    wdName = '';
    wdVipGrade = '';

    code = '??????';

    _$service;

    mounted() {
        this._$service = service(this.$store);
        this.$nextTick(() => {
            document.title = '我要推广';
            this.setUser();
            this.queryCode();
        });
    }
    setUser() {
        let _user = getLocalUserInfo();
        this.headimgurl = _user.headimgurl || '/static/images/pic-login.png';
        this.username = _user.nickname || _user.name || _user.loginName;
    }
    queryCode() {
        let _self = this;
        this._$service.queryCurrentLevel().then((result) => {
            let _wdVipInfo = result.wdVipInfo;
            _wdVipInfo && (_self.wdVipGrade = _wdVipInfo.wdVipGrade);
            _self.wdName = _wdVipInfo.wdName;
        });

        this._$service.queryInviteCode().then((res) => {
            let _result = res.data;
            if (!_result.errorCode) {
                this.code = _result;
            }
        });
    }

    // 推广微码
    toSpread() {
        //屏蔽二维码开店
        // pageNotAccess();
        this.$router.push({ path: 'easy_scanner', query: { type: 'spread', code: this.code } });
    }
    // 分享
    toShare() {
        this.$router.push({ path: 'easy_scanner', query: { type: 'spread', shop: 'share', wdName : this.wdName } });
    }
}
