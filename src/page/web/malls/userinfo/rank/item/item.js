import { Component, Vue, Prop } from 'vue-property-decorator';

import service from '../rankgold.service';

import './item.scss';
@Component({
    template: require('./item.html')
})
export class RankItem extends Vue {

    @Prop({ type: Object, default: () => { return { label: '总榜', ranktype: 'allrank', create: true }; } })
    opts;

    amountGold = 0;

    @Prop({ type: Object, default: () => { return {}; } })
    rankingListConfig;

    defultUserImg = '/static/images/pic-login.png'; //  '/static/images/minishop/dx.png';
    _$service;
    page = 0;
    dataLimit = 100;
    limit = 10;
    rankData = [];
    userInfo = {
        headImage: "",
        nickName: "",
        currentGold: 0,
        rankValue: 0,
    }
    myWdInfo = {};

    serviceListStr = 'queryAllRank';

    showContent = false;

    firstLoadFlag = false;

    mounted() {
        this._$service = service(this.$store);
        let _user = this.$store.state.workVO.user;
        this.userInfo.headImage = _user.headimgurl || this.defultUserImg;
        this.userInfo.nickName = _user.nickname;
        this.$nextTick(() => {
            this.initPage();
        });
    }

    async initPage() {
        if (this.opts.ranktype == 'shoprank') {
            this.serviceListStr = 'queryShopRank';
            this.myWdInfo = await this.$store.dispatch('CHECK_MY_WD_INFO');
            if (this.myWdInfo && this.myWdInfo.infoId) {
                this.showContent = true;
            }
        } else {
            this.showContent = true;
        }
    }

    queryGoldInfo() {
        let _self = this;
        this._$service.queryGoldInfo().then(res => {
            let _result = res.data;
            if (_result && !_result.errorCode) {
                _self.userInfo.currentGold = _result.amountGold;
            }
        });
    }

    infinite(done) {
        let _self = this;
        setTimeout(() => {
            if ((_self.dataLimit / _self.limit) < _self.page + 1) {
                done(true);
            } else {
                _self.fetchRankData(_self.page + 1, done);
            }
        }, 500);
    }

    refresh(done) {
        let _self = this;
        setTimeout(() => {
            _self.fetchRankData(1, done);
        }, 300);
    }

    fetchRankData(page, done) {
        let _self = this;
        let _param = {
            page: page,
            limit: this.limit,
            rankingId: this.rankingListConfig.rankingId
        }
        this._$service[this.serviceListStr](_param).then(res => {
            this.firstLoadFlag = true;
            let _result = res.data;
            if (_result && !_result.errorCode) {
                _result.rankList = _result.rankList || [];
                if (page == 1) {
                    _self.rankData = _self.transData(_result.rankList, page);
                } else {
                    _self.rankData.push(..._self.transData(_result.rankList, page));
                }
                if (_result.rankList.length == 0) {
                    done(true);
                } else {
                    _self.page = page;
                    _self.amountGold =  _result.ownRank.score;
                    if( _self.amountGold){
                        _self.userInfo.rankValue = _result.ownRank.ownRank;
                    }
                    done();
                }
            } else {
                _self.$store.state.$dialog({
                    dialogObj: {
                        title: '提示',
                        content: _result.msg || '系统错误',
                        type: 'error',
                        mainBtn: '确认',
                        mainFn() {
                            done(true);
                        }
                    }
                });
            }
        })
    }

    transData(data, page) {
        for (let index = 0; index < data.length; index++) {
            let element = data[index];
            element.rankValue = Math.max((page - 1), 0) * this.limit + index + 1;
            if (!element.headimgurl) {
                element.headimgurl = this.defultUserImg;
            }
            element.altImg = '/static/images/minishop/dx.png';
        }
        return data;
    }

}