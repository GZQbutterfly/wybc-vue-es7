/**
 * 店铺代理商
 * 
 * 店长推荐说明：
 *（一）模块显示说明
 *         1.若店长快速仓无一件商品，则店长推荐模块隐藏不显示
 *         2.快速仓商品显示条件：（无关快速仓是否开启）
 *                  A.上架且出售
 *                  B.有快速仓库存
 *（二）商品显示规则
 *         1. 如果店长在1个分类中有1个商品，则显示大图片
 *         2 .如果店长在1个分类中有2个商品，则显示2张小图
 *         3 .如果店长在1个分类中有3个或以上的商品，则第一个显示大 图片,其他显示小图
 */
import { Component, Vue } from 'vue-property-decorator';

import { uniq } from 'lodash';

import { GoodsList } from '../../goods_list/goods_list';
import carService from '../../shop_car/finishToCar';


import service from './agent.service';

import './agent.scss';
@Component({
    template: require('./agent.html'),
    components: {
        'goods-list': GoodsList
    }
})
export class AgentMalls extends Vue {

    classifyIds = [];
    classifyIdsStr = '';

    classifyList = [];

    showContent = false;

    page = 0;
    limit = 2;

    _$serivce;
    _$carService;

    async mounted() {
        this._$serivce = service(this.$store);
        this._$carService = carService(this.$store);
        this.shopInfo = await this.$store.dispatch('CHECK_WD_INFO');
        this.shopId = this.shopInfo.shopId;
        this.$nextTick(() => {
            this.initPage();
        });
    }

    async initPage() {
        return await this.queryList();
    }


    /**
     * 分类集合
     */
    async queryClassifyList(page, reFlag) {
        let _result = (await this._$serivce.queryClassifyList({ page: page, limit: this.limit })).data;
        if (!_result || _result.errorCode) {
            return true;
        }
        return this.setList(_result, page, reFlag)
    }

    queryList() {
        this.page = 1;
        return this.queryClassifyList(1, true);
    }

    queryNext() {
        return this.queryClassifyList(this.page + 1);
    }


    async setList(result, page, reFlag) {
        let _list = result.classifyList || [];
        let _flag = false;
        let len = _list.length;
        let _goodsAllList = result.goods || [];
        for (let i = 0; i < len; i++) {
            let _item = _list[i];
            let _goodsList = _goodsAllList[i];
            let _len = _goodsList.length;
            if (_len) {
                !_flag && (_flag = true);
                _item._titleImg = _item.nameImgUrl;
                // （二）商品显示规则
                //  1. 如果店长在1个分类中有1个商品，则显示大图片
                //  2 .如果店长在1个分类中有2个商品，则显示2张小图
                //  3 .如果店长在1个分类中有3个或以上的商品，则第一个显示大 图片,其他显示小图
                if (_len !== 2) {
                    _item._firstGoods = _goodsList.shift();
                }
                _item._subGoodsList = _goodsList;
            }
        }
        // 数据存在 设置 当前加载分页
        len && (this.page = page);
        // 判断数据是否重置
        if (reFlag) {
            this.classifyList = _list;
            this.showContent = _flag;
        } else {
            this.classifyList.push(..._list);
            !this.showContent && (this.showContent = _flag);
        }
        // console.log('店铺推荐内容显示情况：', this.showContent, _list);
        return !len;
    }


    async refresh() {
        return this.initPage();
    }

    async infinite() {

        return this.queryNext();
    }

    toDetail(goods) {
        this.$router.push({ path: 'goods_detail', query: { goodsId: goods.goodsId, isAgent: true } });
    }

    joinCar(item) {
        this._$carService.finishToCar(this, item, 'home', 1);
    }

    toClassify(item){
        this.$router.push({path: 'classify', query:{classify: item.goodsClassifyId}})
    }


}