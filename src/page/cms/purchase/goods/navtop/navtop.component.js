import { Component,Vue} from 'vue-property-decorator';
import './navtop.component.scss';


@Component({
  template: require('./navtop.component.html')
})



export class NavTop extends Vue {
  goHome() {
    this.$router.push({
      path: 'cms_purchase_classify',
    });
  }
  goMine() {
    this.$router.push({
      path: 'cms_purchase_userinfo'
    });
  }
}
