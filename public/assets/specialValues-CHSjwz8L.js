const e={LQ:-1,NO_DETECTADO:-2,NO_ANALIZADO:-3};function a(N,A=!0){return N==null?A?"⚠️":"NA":{[e.LQ]:"NC",[e.NO_DETECTADO]:"ND",[e.NO_ANALIZADO]:"NA"}[Number(N)]??N}export{a as f,e as s};
