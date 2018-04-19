import { Component, Vue } from 'vue-property-decorator';




// ==>
import './layout.scss';
@Component({
    template: require('./layout.html')
})
export class Layout extends Vue {
    


    mounted() {
        this.$nextTick(() => {

        });
    }


    updated() {

    }
}
