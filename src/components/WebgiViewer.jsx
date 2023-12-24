import React, { useRef, useState,useCallback,forwardRef, useImperativeHandle, useEffect } from "react";
import {
  ViewerApp,
  AssetManagerPlugin,
  GBufferPlugin,
  ProgressivePlugin,
  TonemapPlugin,
  SSRPlugin,
  SSAOPlugin,
  BloomPlugin,
  GammaCorrectionPlugin,
  mobileAndTabletCheck,
} from "webgi";
import gsap from "gsap";
import {ScrollTrigger} from 'gsap/ScrollTrigger'
import { scrollAnimation } from "../lib/scroll-animation";
gsap.registerPlugin(ScrollTrigger);
const WebgiViewer= forwardRef((props,ref)=>
{
    const canvasRef = useRef(null);
    const [viewerRef, setViewRef] = useState(null);
    const [targetRef, settargetRef] = useState(null);
    const [cameraRef, setcameraRef] = useState(null);
    const [postionRef, setpostionRef] = useState(null);
    const [previewMode, setpreviewMode] = useState(false);
    const [isMobile, setisMobile] = useState(null);
    const canvasContainerRef = useRef(null)


    useImperativeHandle(ref,()=>
    ({
        triggerPreview(){
            setpreviewMode(true);
            canvasContainerRef.current.style.pointerEvents= "all";
            props.contentRef.current.style.opacity = "0";
                gsap.to(postionRef,
                    {
                        x: 13.04,
                        y: -2.01,
                        z: 2.29,
                        duration: 2,
                        onUpdate: ()=>
                        {
                            viewerRef.setDirty();
                            cameraRef.positionTargetUpdated(true);
                        }
                    })
                    gsap.to(targetRef,
                        {
                            x: 0.11,
                            y: 0.0,
                            z: 0.0,
                            duration: 2,
                        })
                        viewerRef.scene.activeCamera.setCameraOptions({controlsEnabled : true});
        }  
    }));
    const memoizedScollAnimation = useCallback(
      (position,target,isMobile,onUpdate)=>
  {
          if(position && target && onUpdate)
          {
              scrollAnimation(position,target,isMobile,onUpdate);
          }
  },[]
    )
    const setupViewer = useCallback(async()=>{
        const viewer = new ViewerApp({
            canvas: canvasRef.current,
        })
        setViewRef(viewer);
        const isMobileorTablet = mobileAndTabletCheck();
        setisMobile(isMobileorTablet);
        const manager = await viewer.addPlugin(AssetManagerPlugin)
        
        const camera = viewer.scene.activeCamera;
        const position = camera.position;
        const target = camera.target;
        setcameraRef(camera);
        setpostionRef(position);
        settargetRef(target);
        // or use this to add all main ones at once.// check the source: https://codepen.io/repalash/pen/JjLxGmy for the list of plugins added.
    
        // Add more plugins not available in base, like CanvasSnipperPlugin which has helpers to download an image of the canvas.
        await viewer.addPlugin(GBufferPlugin)
        await viewer.addPlugin(new ProgressivePlugin(32))
        await viewer.addPlugin(new TonemapPlugin(true))
        await viewer.addPlugin(GammaCorrectionPlugin)
        await viewer.addPlugin(SSAOPlugin)
        await viewer.addPlugin(SSRPlugin)
        await viewer.addPlugin(BloomPlugin)
        
        viewer.renderer.refreshPipeline();
        await manager.addFromPath("scene-black.glb")
        viewer.getPlugin(TonemapPlugin).config.clipBackground = true;
        viewer.scene.activeCamera.setCameraOptions({controlsEnabled : true})
        if(isMobileorTablet)
        {
            position.set(-16.7,1.17,11.7);
            target.set(0,1,37,0);
            props.contentRef.current.className ="mobile-or-tablet";
        }
        window.scrollTo(0,0);
        let needsUpdate = true;
        const onUpdate = () =>
        {
          needsUpdate = true;
          viewer.setDirty();
        }
        viewer.addEventListener("preFrame", ()=> {
              if(needsUpdate)
              {
                  camera.positionTargetUpdated(true);
                  needsUpdate = false;
              }
        })
        memoizedScollAnimation(position,target,isMobileorTablet,onUpdate);
      },[]);
  
      useEffect(()=>
      {
          setupViewer();
      },[]);
      const handleExit = useCallback (()=>
      {
        canvasContainerRef.current.style.pointerEvents= "none";
            props.contentRef.current.style.opacity = "1";
            viewerRef.scene.activeCamera.setCameraOptions({controlsEnabled : false})
            setpreviewMode(false);
            gsap.to(postionRef,
                {
                    x: !isMobile ? -1.56 : 9.36,
                    y:!isMobile ? 5.0: 10.95,
                    z: !isMobile ? 0.01: 0.09,
                    scrollTrigger:
                    {
                        trigger :'.display-section',
                        //trigger which will start the animation
                        start: "top bottom",
                        // when to start the animation
                        stop: "top top",
                        //when top  reaches the top of viewport
                        scrub: 2,
                        immediateRender: false
                    },
                    onUpdate:()=>
                    {
                        viewerRef.setDirty();
                        cameraRef.positionTargetUpdated(true);
                    }
                })
                gsap.to(targetRef,
                    {
                        x:!isMobile ? -0.55 : -1.62,
                        y: !isMobile ? 0.0: 0.02,
                        z:!isMobile ? 0.0: -0.06,
                        scrollTrigger:
                        {
                            trigger :'.display-section',
                            //trigger which will start the animation
                            start: "top bottom",
                            // when to start the animation
                            stop: "top top",
                            //when top  reaches the top of viewport
                            scrub: 2,
                            immediateRender: false
                        },
                    })
      },[canvasContainerRef,viewerRef,postionRef,cameraRef,targetRef])
    return (
      <div ref={canvasContainerRef} id="webgi-canvas-container">
        <canvas id="webgi-canvas" ref={canvasRef} />
        {previewMode &&
        (
            <button className="button" onClick={handleExit}>Exit</button>
        )
            
        }
      </div>
    );
}) 

export default WebgiViewer;
