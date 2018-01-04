import {Component} from 'vue-property-decorator';
import  BaseVue  from 'base.vue';

import packageService from './package.service';
import './package.scss';
/*
商品
进货价
    roll    券+币     gsMoneyRoll+gsMoneyPrice
    roll    币        gsMoneyPrice
活动(特)价
    roll    券+币     moneyRoll+moneyPrice
    roll    币        moneyPrice
*/
@Component({
    template: require('./package.html')
})
export class Package extends BaseVue {
    //tag
    packageState = -1; // 0固定套餐 1套餐失效 2购买为满足条件 3满足最小消费
    //info
    id;
    goodsList = [];
    goodsNumb = [];
    packageType;
    minMoney = 0;
    //计算出来的总价
    totalMoney = 0;
    payMoney = 0;
    redirectMoney = 0;
    //所有的特价商品列表
    allRedirectGoods = [];
    _$service;
    data() {
        return {

        };
    }

    mounted() {
        // 注册服务
        this._$service = packageService(this.$store);
        this.$nextTick(() => {
            // 套餐id
            this.id = this.$route.query.id;
            // 重加载
            this.reload();
        });
    }

    //重加载
    reload(cb = null) {
        let self = this;
        this._$service.getPackageData(this.id).then((res) => {
            let _result = res.data;
            if (_result.errorCode) {
                return;
            }
            let data = _result.data[0] || _result.data;
            let now = new Date();
            let end = new Date(data.endAt);
            let config = {
                title: data.shareTitle,
                imgUrl: data.shareImg,
                link: window.location.href.split('#')[0],
                desc: data.shareMsg,
            }
            self.updateWxShare(config);
            if (end <= now) {
                
                let dialogObj = {
                    title: '',
                    content: '活动结束',
                    assistBtn: '',
                    mainBtn: '知道了',
                    type: 'info',
                    assistFn() {

                    },
                    mainFn() {
                        window.history.back();
                    }
                };
                self.$store.state.$dialog({ dialogObj });
            } else {
                self._$service.getPackageGoodsList(self.id).then((res) => {
                    self.goodsList = res.data.data;
                    //test
                    // self.goodsList[0].redirect = 2;
                    //套餐类型
                    self.packageType = self.goodsList[0].packageType;
                    if (self.packageType == 1) {
                        self.minMoney = 0;
                    } else {
                        self.minMoney = self.goodsList[0].minMoney;
                    }
                    self.redirectMoney = 0;
                    //info
                    console.log('套餐类型', ['', '固定套餐', '自选套餐'][self.packageType]);
                    console.log('所有套餐商品', self.goodsList);
                    self.allRedirectGoods = [];
                    //检查是否为固定套餐
                    if (self.packageType == 1) {
                        self.packageState = 0;
                    }

                    let len = self.goodsList.length;
                    for (let i = 0; i < len; i++) {

                        let item = self.goodsList[i];
                        self.goodsNumb.push(item.number);
                        //check
                        if (item.number == null) {
                            self.goodsNumb[i] = 1;
                        }

                        //检查每一件商品的库存以及下架 0正常售卖 1商品下架 2商品无货
                        item.checkGoods = 0;
                        if (item.state != 1) {
                            item.checkGoods = 1;
                        }
                        else if (item.amount < item.number) {
                            item.checkGoods = 2;
                        }
                        if (self.packageType == 2 && item.packageGsType == 2 && item.checkGoods) {
                            self.goodsNumb[i] = 0;
                        }

                        //筛选出所有特价商品
                        if (item.redirect == 2) {
                            self.allRedirectGoods.push(item);
                        }

                        //检查是否能购买
                        if (self.packageState != 1) {
                            if (self.packageType == 1) {
                                //固定套餐判断所有
                                if (item.checkGoods) {
                                    self.packageState = 1;
                                }
                            }
                            else if (self.packageType == 2) {
                                //自选套餐判断主商品
                                if (item.packageGsType == 1) {
                                    if (item.checkGoods) {
                                        self.packageState = 1;
                                    }
                                }
                            }
                        }
                    }
                    console.log('所有特价商品', self.allRedirectGoods)
                    //初始化计算一次价格
                    self.setMoney();
                    //refresh
                    cb && cb();
                });
            }
        });
    }

    // 计算payMoney 和 totalMoney
    setMoney() {

        this.totalMoney = 0;
        let len = this.goodsList.length;
        for (let i = 0; i < len; i++) {
            let goods = this.goodsList[i];
            this.totalMoney += this.goodsNumb[i] * goods.gsMoneyPrice;
        }
        let _money = 0;
        this.redirectMoney = 0;
        if (this.totalMoney > this.minMoney) {
            //计算达到最低消费的优惠
            for (let i = 0; i < len; i++) {
                let goods = this.goodsList[i];
                if (goods.redirect == 2) {
                    this.redirectMoney += (goods.purchasePrice - goods.moneyPrice) * this.goodsNumb[i];
                }
            }
            console.log('达到最小消费,优惠' + (this.redirectMoney / 100).toFixed(2));
            _money = this.redirectMoney;
        }
        //固定套餐或套餐失效 不计算
        if (this.packageState != 0 && this.packageState != 1) {
            if (this.totalMoney >= this.minMoney) {
                this.packageState = 3;
            } else {
                this.packageState = 2;
            }
        }
        this.payMoney = this.totalMoney - _money;
    }

    //商品数量增加
    addNumb(i) {
        let goods = this.goodsList[i];
        if (this.packageState == 1 || goods.checkGoods) {
            //无效套餐或无效商品不能操作
            return;
        }
        if (goods.amount > this.goodsNumb[i]) {
            this.goodsNumb[i] = this.goodsNumb[i] + 1;
            this.setMoney();
        }
    }

    //商品数量减少
    minusNumb(i) {
        let goods = this.goodsList[i];
        if (this.packageState == 1 || goods.checkGoods) {
            //无效套餐或无效商品不能操作
            return;
        }
        if (this.goodsNumb[i] - 1 >= 0) {
            this.goodsNumb[i] = this.goodsNumb[i] - 1;
            this.setMoney();
        }
    }

    refresh(done) {
        let _self = this;
        setTimeout(function () {
            _self.reload(done);
        }, 500);
    }

    infinite(done) {
        done(true)
    }

    goBuy() {
        if (this.packageState != 1) {
            console.log('去下订单...');
            let numb = this.goodsNumb.join(",");
            this.$router.push({ path: 'order_submit', query: { packageId: this.id, packageNumb: numb, orderSrouce: 'package' } });
        }
        if (this.packageState == 1) {
            let _self = this;
            let dialogObj = {
                title: '提示',
                content: '非常抱歉，当前套餐已失效，暂无法购买！',
                type: 'info',
                assistBtn: '',
                mainBtn: '知道啦',
                assistFn() {
                },
                mainFn() {
                }
            };
            this.$store.state.$dialog({ dialogObj });
        }
    }

}
