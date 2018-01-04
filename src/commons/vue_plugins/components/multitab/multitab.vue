<template lang="html">
    <div class="tabs-view">
        <div v-for="(tab, i) in tabs" v-if="i<maxItem-1" class="navbar__item" @click="tabChange(i)" :style="{backgroundColor:tabIndex==i?custStyle.itemOnColor:custStyle.itemColor,color:tabIndex==i?custStyle.textOnColor:custStyle.textColor}">
            <div class="navbar__item_line" :style="{borderTopColor:tabIndex==i?custStyle.lineOnColor:custStyle.lineColor}"></div>
            {{tab}}
        </div>

        <!-- 最后一项 -->
        <div v-if="tabs.length==maxItem" class="navbar__item" @click="tabChange(maxItem-1)" :style="{backgroundColor:tabIndex==maxItem-1?custStyle.itemOnColor:custStyle.itemColor,color:tabIndex==maxItem-1?custStyle.textOnColor:custStyle.textColor}">
            <div class="navbar__item_line" :style="{borderTopColor:tabIndex==maxItem-1?custStyle.lineOnColor:custStyle.lineColor}"></div>
            {{tabs[maxItem-1]}}
        </div>

        <div v-if="tabs.length>maxItem" class="more-tab weui-flex" @click="expandMenu()" :style="{backgroundColor:tabIndex>=maxItem?custStyle.itemOnColor:custStyle.itemColor}">
            <div class="navbar__item_line" :style="{borderTopColor:tabIndex>=maxItem-1?custStyle.lineOnColor:custStyle.lineColor,color:tabIndex < maxItem-1?custStyle.textOnColor:custStyle.textColor}"></div>
            <!-- <div class="vline"></div> -->
            <!-- <span>{{tabIndex
                < maxItem-1 ? more:tabs[tabIndex]}}</span> -->
                <span>{{tabMoreText()}}</span>
            <i class="iconfont icon-gengduo"></i>
        </div>
        <div v-show="isMenuExpanded">
            <div class="expand-menu-background" @click="expandMenu"></div>
            <div class="expand-menu bubble">
                <div v-for="(tab,i) in tabs" v-if="i>=maxItem-1" class="menu-item" @click.stop="tabChange(i)">{{tab}}</div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        tabs: {
            type: Array,
            default: () => []
        },
        index: {
            type: Number,
            default: 0
        },
        more: {
            type: String,
            default: '更多状态',
        },
        maxItem: {
            default: 4
        },
        custStyle: {
            type: Object,
            default: () => {
                return {
                    lineOnColor: '#7ecc44',
                    lineColor: '#ffffff',
                    itemColor: '#FFFFFF',
                    itemOnColor: '#FFFFFF'
                }
            }
        }
    },
    data() {
        return {
            tabIndex: Number(this.$props.index),
            perTabIndex: 0,
            isMenuExpanded: false
        }
    },
    mounted() {
        if (this.$props.index >= this.$props.maxItem - 1) {
            this.perTabIndex = this.$props.index;
        }
    },
    methods: {
        tabChange(i) {
            if (i >= this.$props.maxItem - 1) {
                this.perTabIndex = i;
            }

            this.tabIndex = i;
            this.$emit('on-change', i);
            this.isMenuExpanded = false;
        },
        tabMoreText() {

            if (this.perTabIndex >= this.$props.maxItem - 1) {
                return this.$props.tabs[this.perTabIndex];
            } else {
                return this.$props.more;
            }
        },
        expandMenu() {
            this.isMenuExpanded = !this.isMenuExpanded;
        }
    }
}
</script>

<style lang="scss" scoped>
.tabs-view {
    position: relative;
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    z-index: 500;
    top: 0;
    width: 100%;
    background-color: #ffffff;
    .navbar__item {
        position: relative;
        display: block;
        -webkit-box-flex: 1;
        -ms-flex: 1;
        flex: 1;
        padding: 0.13rem 0;
        text-align: center;
        font-size: 0.15rem;
        -webkit-tap-highlight-color: transparent;
    }
    .navbar__item_line {
        border-top: 1px solid;
        position: absolute;
        bottom: 0;
        width: 100%;
    }
    .more-tab {
        position: relative;
        display: flex;
        width: 1.0rem;
        padding: 0.05rem 0;
        text-align: center;
        font-size: 0.15rem;
        -webkit-tap-highlight-color: transparent;
        .vline {
            position: absolute;
            width: 1px;
            background-color: #b3b3b3;
            height: 40%;
            top: 30%;
        }
        span {
            font-size: 0.15rem;
            position: relative;
            text-align: center;
            line-height: 0.4rem;
            flex: 1;
        }
        i {
            text-align: center;
            position: relative;
            line-height: 0.4rem;
            font-size: 0.22rem;
        }
    }
    .more-tab:before {
        content: '';
        position: relative;
        right: 0;
        top: 0.1rem;
        height: 0.2rem;
        left: 2px;
        width: 1px;
        background-color: #e6e6e6;
    }
    .expand-menu {
        position: absolute;
        padding: 0.1rem;
        border-radius: 4px;
        flex-direction: column;
        right: 0.1rem;
        top: 0.5rem;
        width: 1rem;
        background-color: #37363c;
        .menu-item {
            font-size: 0.15rem;
            line-height: 0.45rem;
            text-align: center;
            color: #FFFFFF;
        }
        .menu-background {
            position: absolute;
            background-color: gray;
            width: 100%;
            height: 100%;
        }
    }
    // .bubble:before {
    //     content: "";
    //     position: absolute;
    //     bottom: 0;
    //     border: 0.34rem solid  ;
    //     border-bottom-color: #37363c;
    //     margin: -100% 0 0 0 ;
    // }
    .expand-menu-background {
        position: fixed;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        width: 100%;
        height: 100%;
        z-index: -100;
    }
}
</style>
