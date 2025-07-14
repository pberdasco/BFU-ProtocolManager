import{r as e,C as c,d0 as l,b2 as d}from"./index-C37p9Lq4.js";/*!
 * devextreme-react
 * Version: 24.2.3
 * Build date: Fri Dec 06 2024
 *
 * Copyright (c) 2012 - 2024 Developer Express Inc. ALL RIGHTS RESERVED
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file in the root of the project for details.
 *
 * https://github.com/DevExpress/devextreme-react
 */const C=e.memo(e.forwardRef((t,s)=>{const n=e.useRef(null);e.useImperativeHandle(s,()=>({instance(){var o;return(o=n.current)==null?void 0:o.getInstance()}}),[n.current]);const m=e.useMemo(()=>["items"],[]),r=e.useMemo(()=>["onContentReady","onDisposing","onInitialized","onItemClick","onItemContextMenu","onItemHold","onItemRendered"],[]),i=e.useMemo(()=>({defaultItems:"items"}),[]),p=e.useMemo(()=>({item:{optionName:"items",isCollectionItem:!0}}),[]),a=e.useMemo(()=>[{tmplOption:"itemTemplate",render:"itemRender",component:"itemComponent"}],[]);return e.createElement(c,{WidgetClass:l,ref:n,subscribableOptions:m,independentEvents:r,defaults:i,expectedChildren:p,templateProps:a,...t})})),u=t=>e.createElement(d,{...t,elementDescriptor:{OptionName:"items",IsCollectionItem:!0,TemplateProps:[{tmplOption:"template",render:"render",component:"component"}]}}),f=Object.assign(u,{componentType:"option"});export{C as B,f as I};
