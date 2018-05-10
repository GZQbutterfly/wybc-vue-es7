import { Component, Vue } from 'vue-property-decorator';



import './gift.scss';
@Component({
    template: require('./gift.html')
})
export class RankGift extends Vue {
    imgsrc = '';
    mounted() {
        this.$nextTick(() => {
            this.initPage();
        });
    }

    initPage() {
        let _self = this;
        this.imgsrc = window.sessionStorage.__rankgiftimgsrc;
        // if (this.imgsrc) {
        //     let img = new window.Image();
        //     img.src = this.imgsrc;
        //     img.onload = function () {
        //         let bw = document.body.offsetWidth;
        //         let bh = document.body.offsetHeight;
        //         console.log(bw, bh);
        //         let imgDom = _self.$refs.imgRef;
        //         imgDom.style.width = (img.width > bw ? bw : img.width) + 'px';
        //         imgDom.style.height = img.height / 2 + 'px';
        //         imgDom.src = img.src;
        //     }
        // }
    }
}