import { Component } from 'vue-property-decorator';
import BaseVue from 'base.vue';
import service from "./coupon.service";
import './coupon.scss';

@Component({
    template: require('./coupon.html'),
})

export class CmsCoupon extends BaseVue {
    headNav = [{ name: "可使用进货券", number: 0 }, { name: "不可使用进货券", number: "" }];
    headIndex = 0;
    couponList = [];
    _$service;
    couponState = 0;
    id=0;
    page=1;
    firstLoad = true;
    confirmCC= true;
    // price = 0;
    mounted() {
     document.title="进货券";
      this._$service = service(this.$store);
      this.initPage();
    }
   initPage(){
       let _self = this;
       _self.page = 1;
       _self.firstLoad = true;
       _self.confirmCC = true;
       _self.couponList = [];
       this.id = this.$route.query.id;
       let couponParam =JSON.parse(sessionStorage.getItem("cmsCouponParam"));
       let _param = {
           limit:10,
           page:1,
           couponState: this.couponState,
           totalPrice: couponParam.totalPrice,
           goodsIdListStr: couponParam.goodsIdList.join(","),
           priceListStr: couponParam.priceList.join(","),
           shopIdStr: couponParam.shopIdStr.join(",")
       } 
       this._$service.getCouponList(_param).then(res=>{
          if(!res.data.errorCode){
            //   res.data.data.forEach(item=>{
            //       if (id == item.userCouponId){
            //           item.checked = true;
            //         //   _self.confirmCC = false;
            //       }else{
            //           item.checked = false;
            //         //   item.price = item.minOrderPrice - couponParam.totalPrice;
            //       }
            //   });
              _self.couponList = res.data.data;
              if(_self.headIndex==0){
                  _self.headNav[0].number = res.data.data.length
              }
             this.firstLoad = false;
          }
       })
   }
    refresh(done) {
        done(true);
    }

    infinite(done) {
        if(this.firstLoad = true){
            done(true);
            return;
        }
        if(this.headIndex==1){
            let _self = this;
            setTimeout(() => {
                _self.loadMore(done);
            }, 300);
        }else{
            done(true);
        }
    }
    loadMore(done) {
        this.page++;
        if (this.page > 3) {
            done(true);
            reurn;
        }
        let _self = this;
        let couponParam = JSON.parse(sessionStorage.getItem("cmsCouponParam"));
        let _param = {
            limit: 10,
            page: 1,
            couponState: this.couponState,
            totalPrice: couponParam.totalPrice,
            goodsIdListStr: couponParam.goodsIdList.join(","),
            priceListStr: couponParam.priceList.join(","),
            shopIdStr: couponParam.shopIdStr.join(","),
        } 
        this._$service.getCouponList(_param).then(res => {
            let _result = res.data;
            this.firstLoad = false;
            if (_result.errorCode || _result.data.length == 0) {
                _self.page--;
                done(true);
                return;
            }
            _self.couponList.push(..._result.data);
            done(false);
        })
    }
    changeHeadNav(index){
        this.headIndex = index;
        this.couponState = index;
        this.initPage();
    }
    //选择优惠券
    chooseCoupon(item, index){
        if(this.id == item.userCouponId){
            this.id = null;
        }else{
            this.id = item.userCouponId;
            sessionStorage.setItem("CmsCouponDetail",JSON.stringify(item));
        }
        
        // this.confirmCC = false;
        // this.couponList[index].checked = !this.couponList[index].checked;
        // this.id = this.couponList[index].userCouponId;
        
        // this.couponList.forEach((item,i)=>{
        //     if(i!=index){
        //         item.checked = false;
        //     }
        // });
    }
    //回提交订单
    goOrderSubmit(){
        // if (this.confirmCC){
        //     return;
        // }
        let _query = {}, _param = this.$route.query;
        if (_param.orderSrouce == "goods") {
            _query = {
                goodsId: _param.goodsId,
                goodsType: _param.goodsType,
                number: _param.number,
                orderSrouce: _param.orderSrouce,
                id: this.id,
                stockType:1
            }
        } else {
            _query = {
                cartId: _param.cartId,
                orderSrouce: _param.orderSrouce,
                id: this.id,
                stockType:1
            }
        }
        this.$router.replace({ path:"cms_purchase_submit_order",query:_query});
    }
   
}