import {Component, Vue, Watch} from 'vue-property-decorator';

require('./num.picker.scss');

@Component({
    template: require('./num.picker.html'),
    props: ['goods', 'affirmFn', 'showIt', 'hideFn', 'closeFn','min']
})

export class NumberPicker extends Vue {
    num = 1;
    isShow = false;
    showIt = false;
    total = 0;
    priceShow = false;
    data() {
        return {
            isShow: this.showIt
        };
    }

    mounted() {
        this.total = 0;
        this.priceShow = false;
    }

    @Watch('showIt')
    watchShowIt(newVal, oldVal){
        setTimeout(() => {
            this.isShow = newVal
        }, 100)
        if (newVal) {
            document.body.style.overflow = 'hidden'
        }
    }

    cancel() {
        //can't send data 2 parentNode
        //so try callback use parent's fucntion
        if (this.$props.hideFn) {
            this.$props.hideFn();
            
        }
    }

    nextStep() {
        let isNum = ('' + this.num).indexOf('.');
        if (!this.num || this.num <= 0 || isNum == 1) {
            this.num = 1;
            let _toast = this.$store.state.$toast;
            _toast({ title: '输入数量不正确', success: false });
            this.total = 0;
            this.priceShow = false;
            return;
        }
        if (this.$props.goods.userMaxBuyNum == 0) {
            let _toast = this.$store.state.$toast;
            _toast({ title: '该商品不能购买!', success: false });
            this.num = 1;
            this.total = 0;
            this.priceShow = false;
            this.isShow = false;
            this.$props.closeFn();
            return;
        }
        if (this.$props.affirmFn) {
            this.$props.affirmFn(this.num);
        }
        this.cancel();
        this.num = 1;
        this.total = 0;
        this.priceShow = false;
    }

    decrease() {
        if (this.num > 1) {
            this.priceShow = true;
            this.num--;
            this.total = this.$props.goods.moneyPrice * this.num;
            return;
        }
        this.num = 1;
        this.priceShow = false;
    }
    onNum(){
        this.getCount();  
    }
    increase() {
        this.num++;
        this.getCount();
       
    }
    getCount(){
        let _this = this;
        let maxNum = this.$props.goods.userMaxBuyNum;
        this.priceShow = true;
        if (maxNum&&this.num > maxNum) {
                this.num = maxNum;
                this.total = this.$props.goods.moneyPrice * this.num;
                let _toast = this.$store.state.$toast;
                _toast({ title: '一次最多购买' + maxNum + '件', success: false });
                return;
            }
        this.total = this.$props.goods.moneyPrice * this.num;    
    }
    onClose() {
        this.num = 1;
        this.priceShow = false;
        this.total = 0;
        this.isShow = false;
        this.$props.closeFn();
    }
}
