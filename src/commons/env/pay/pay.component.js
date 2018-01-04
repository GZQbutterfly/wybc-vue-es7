import Component from 'vue-class-component';
import Vue from 'vue';
import './pay.component.scss';

// ==>
@Component({
    props: {
        listPays: {
            type: Array,
            default: []
        },
        selectPay: {
            type: Function,
            default: () => { }
        },
        closePay: {
            type: Function,
            default: () => { }
        }
    },
    template: require('./pay.component.html')
})
export class PayComponent extends Vue {
    selectPay;
    closePay;
    close() {
        this.closePay();
        this.$el.remove();
    }
    select(item) {
        this.selectPay(item);
        this.$el.remove();
    }
}
