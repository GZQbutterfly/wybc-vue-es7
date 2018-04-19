/**
 * 我的优惠券 列表
 */
import {
    Component
} from 'vue-property-decorator';
import BaseVue from 'base.vue';
import service from './usercoupon.service';
import MultiTab from '../../../../../commons/vue_plugins/components/multitab/multitab.vue';
import {
    CouponItem
} from './item/coupon.item';
import './usercoupon.scss';

@Component({
    template: require('./usercoupon.html'),
    components: {
        tab: MultiTab,
        ci: CouponItem,
    }
})

export class CmsUserCoupon extends BaseVue {

    tableIndex = 0;

    couponList = [
        {
            index:0,
            page:0,
            data:{}
        },{
            index:1,
            page:0,
            data:{}
        },{
            index:2,
            page:0,
            data:{}
        }
    ];

    _$service ;

    data() {
        return {
            tabItemList: ['可使用', '已使用', '已失效'],
            index: Number(this.$route.query.index) ? Number(this.$route.query.index) : 0,
            custStyle: {
                lineColor: '#f2f2f2',
                lineOnColor: '#7ecc44',
                textColor: '#333333',
                textOnColor: '#FFFFFF',
                itemColor: '#FFFFFF',
                itemOnColor: '#7ecc44'
            }
        };
    }

    mounted() {
        this._$service = service(this.$store);
        document.title = "我的进货券";
        let _self = this;
        this.$nextTick(() => {
            _self.tableIndex = Number(_self.$route.query.index) ? Number(_self.$route.query.index) : 0;
        });
    }

    refresh(done) {
        let _self = this;
        setTimeout(() => {
            _self.fetchCouponData(_self.tableIndex,1,done);
        }, 500)
    }

    fetchCouponData(index, page, done) {
        let _self = this;
        let _limit = 10000;
        if (index == 1) {
            _limit = 5;
        }else if (index==2) {
            _limit = 5;
        }
        let _params = {
            couponType: 2,
            couponState: index,
            page: page,
            limit: _limit
        }
        this._$service.getCMSCouponList(_params)
            .then(res => {
                if (res && !res.errorCode) {
                    let _coupons = res.data.data;
                    if (_coupons && _coupons.length > 0) {
                        _coupons.forEach(element => {
                            element.state = index;
                        });
                    }

                    let _tab = _self.couponList[index];

                    if (page == 1) {
                        _tab.data = _coupons;
                    } else {
                        _tab.data.push(..._coupons);
                    }
                    if (_coupons && _coupons.length > 0) {
                         _tab.page = page;
                    }
                    if (done) {
                        done(true);
                    }
                } else {
                    done(false);
                }
            })
    }

    infinite(done) {
        let _self = this;
        setTimeout(() => {
            let _tab = _self.couponList[_self.tableIndex];
            if (_self.tableIndex == 0) {//优惠券未分页
                _self.fetchCouponData(0, 1, done);
            }else{
                if (_tab.page>3) {
                    done(true);
                } else {
                    _self.fetchCouponData(_self.tableIndex, _tab.page + 1, done);
                }
            }
        }, 500)
    }

    onChange(i) {
        this.tableIndex = i;
        this.$router.replace({
            path: 'cms_my_coupon',
            query: {
                index: i
            }
        });
    }
}