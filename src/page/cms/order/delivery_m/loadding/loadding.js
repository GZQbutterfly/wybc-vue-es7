import { Component, Vue } from 'vue-property-decorator';




import './loadding.scss';
@Component({
    template: require('./loadding.html'),
})
export class Loadding extends Vue {


    noTouchMove(e) {
        e.preventDefault();
        return false;
    }

}