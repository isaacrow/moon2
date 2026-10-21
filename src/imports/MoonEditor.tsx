import svgPaths from "./svg-4a1owbzhq6";
import imgImg from "figma:asset/448923f9298ec547f27dd322785433298cd5ac34.png";

function Section() {
  return <div className="absolute h-0 left-0 top-0 w-[1679.2px]" data-name="Section" />;
}

function ChevronLeft() {
  return (
    <div className="absolute left-[20.8px] size-[16px] top-[14.8px]" data-name="ChevronLeft">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="ChevronLeft">
          <path d="M10 12L6 8L10 4" id="Vector" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Button() {
  return (
    <div className="bg-[rgba(255,255,255,0.6)] h-[45.6px] relative rounded-[12px] shrink-0 w-[99.537px]" data-name="button">
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(255,255,255,0.5)] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <ChevronLeft />
        <p className="-translate-x-1/2 absolute font-['Inter:Medium',sans-serif] font-medium leading-[24px] left-[61.8px] not-italic text-[#0a0a0a] text-[16px] text-center top-[8.6px]">Back</p>
      </div>
    </div>
  );
}

function Img() {
  return (
    <div className="h-[64px] relative shrink-0 w-[96px]" data-name="img">
      <img alt="" className="absolute bg-clip-padding border-0 border-[transparent] border-solid inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImg} />
    </div>
  );
}

function H() {
  return (
    <div className="absolute content-stretch flex h-[31.988px] items-start left-0 shadow-[0px_4px_8px_0px_rgba(0,0,0,0.15)] top-0 w-[239.275px]" data-name="h1">
      <p className="flex-[1_0_0] font-['Inter:Bold',sans-serif] font-bold leading-[32px] min-h-px min-w-px not-italic relative text-[24px] text-white tracking-[-0.48px] whitespace-pre-wrap">Moon Engine</p>
    </div>
  );
}

function P() {
  return (
    <div className="absolute h-[20px] left-0 top-[31.99px] w-[239.275px]" data-name="p">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[14px] text-[rgba(255,255,255,0.8)] top-[-0.2px]">designed and developed by isaac faleh</p>
    </div>
  );
}

function Container3() {
  return (
    <div className="h-[51.987px] relative shrink-0 w-[239.275px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <H />
        <P />
      </div>
    </div>
  );
}

function Container2() {
  return (
    <div className="h-[64px] relative shrink-0 w-[466.813px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[16px] items-center relative size-full">
        <Button />
        <Img />
        <Container3 />
      </div>
    </div>
  );
}

function Container1() {
  return (
    <div className="h-[64px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between pr-[1164.388px] relative size-full">
          <Container2 />
        </div>
      </div>
    </div>
  );
}

function User() {
  return (
    <div className="absolute left-[16px] size-[16px] top-[10px]" data-name="User">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="User">
          <path d={svgPaths.p399eca00} id="Vector" stroke="var(--stroke-0, #155DFC)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.pc93b400} id="Vector_2" stroke="var(--stroke-0, #155DFC)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Button1() {
  return (
    <div className="bg-[rgba(255,255,255,0.95)] h-[36px] relative rounded-[12px] shadow-[0px_2px_8px_0px_rgba(0,0,0,0.1)] shrink-0 w-[165.575px]" data-name="button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <User />
        <p className="-translate-x-1/2 absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-[95.5px] not-italic text-[#155dfc] text-[14px] text-center top-[7.8px]">NAF Auth Names</p>
      </div>
      <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0px_1px_0px_0px_white]" />
    </div>
  );
}

function Button2() {
  return (
    <div className="h-[36px] relative rounded-[20px] shrink-0 w-[164.75px]" data-name="button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center px-[16px] py-[8px] relative size-full">
        <p className="font-['Inter:Medium',sans-serif] font-medium leading-[20px] not-italic relative shrink-0 text-[#364153] text-[14px] text-center">NAF Personal Names</p>
      </div>
    </div>
  );
}

function Building() {
  return (
    <div className="absolute left-[16px] size-[16px] top-[10px]" data-name="Building">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Building">
          <path d={svgPaths.p1674e600} id="Vector" stroke="var(--stroke-0, #364153)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d="M6 14.6667V12H10V14.6667" id="Vector_2" stroke="var(--stroke-0, #364153)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d="M5.33333 4H5.34" id="Vector_3" stroke="var(--stroke-0, #364153)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d="M10.6667 4H10.6733" id="Vector_4" stroke="var(--stroke-0, #364153)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d="M8 4H8.00667" id="Vector_5" stroke="var(--stroke-0, #364153)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d="M8 6.66667H8.00667" id="Vector_6" stroke="var(--stroke-0, #364153)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d="M8 9.33333H8.00667" id="Vector_7" stroke="var(--stroke-0, #364153)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d="M10.6667 6.66667H10.6733" id="Vector_8" stroke="var(--stroke-0, #364153)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d="M10.6667 9.33333H10.6733" id="Vector_9" stroke="var(--stroke-0, #364153)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d="M5.33333 6.66667H5.34" id="Vector_10" stroke="var(--stroke-0, #364153)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d="M5.33333 9.33333H5.34" id="Vector_11" stroke="var(--stroke-0, #364153)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Button3() {
  return (
    <div className="h-[36px] relative rounded-[20px] shrink-0 w-[192.7px]" data-name="button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Building />
        <p className="-translate-x-1/2 absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-[108.5px] not-italic text-[#364153] text-[14px] text-center top-[7.8px]">NAF Corporate Name</p>
      </div>
    </div>
  );
}

function Button4() {
  return (
    <div className="h-[36px] relative rounded-[20px] shrink-0 w-[176.938px]" data-name="button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center px-[16px] py-[8px] relative size-full">
        <p className="font-['Inter:Medium',sans-serif] font-medium leading-[20px] not-italic relative shrink-0 text-[#364153] text-[14px] text-center">NAF Conference Name</p>
      </div>
    </div>
  );
}

function MapPin() {
  return (
    <div className="absolute left-[16px] size-[16px] top-[10px]" data-name="MapPin">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="MapPin">
          <path d={svgPaths.p14548f00} id="Vector" stroke="var(--stroke-0, #364153)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p17781bc0} id="Vector_2" stroke="var(--stroke-0, #364153)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Button5() {
  return (
    <div className="h-[36px] relative rounded-[20px] shrink-0 w-[160.338px]" data-name="button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <MapPin />
        <p className="-translate-x-1/2 absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-[92px] not-italic text-[#364153] text-[14px] text-center top-[7.8px]">NAF Geographic</p>
      </div>
    </div>
  );
}

function Tag() {
  return (
    <div className="absolute left-[16px] size-[16px] top-[10px]" data-name="Tag">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g clipPath="url(#clip0_524_4216)" id="Tag">
          <path d={svgPaths.p9bc8e70} id="Vector" stroke="var(--stroke-0, #364153)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p8247300} fill="var(--fill-0, #364153)" id="Vector_2" stroke="var(--stroke-0, #364153)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
        <defs>
          <clipPath id="clip0_524_4216">
            <rect fill="white" height="16" width="16" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Button6() {
  return (
    <div className="h-[36px] relative rounded-[20px] shrink-0 w-[103.738px]" data-name="button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Tag />
        <p className="-translate-x-1/2 absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-[64.5px] not-italic text-[#364153] text-[14px] text-center top-[7.8px]">NAF All</p>
      </div>
    </div>
  );
}

function Globe() {
  return (
    <div className="absolute left-[16px] size-[16px] top-[10px]" data-name="Globe">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g clipPath="url(#clip0_524_4252)" id="Globe">
          <path d={svgPaths.p39ee6532} id="Vector" stroke="var(--stroke-0, #364153)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p14d10c00} id="Vector_2" stroke="var(--stroke-0, #364153)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d="M1.33333 8H14.6667" id="Vector_3" stroke="var(--stroke-0, #364153)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
        <defs>
          <clipPath id="clip0_524_4252">
            <rect fill="white" height="16" width="16" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Button7() {
  return (
    <div className="h-[36px] relative rounded-[20px] shrink-0 w-[112.3px]" data-name="button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Globe />
        <p className="-translate-x-1/2 absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-[68.5px] not-italic text-[#364153] text-[14px] text-center top-[7.8px]">Wikidata</p>
      </div>
    </div>
  );
}

function Container4() {
  return (
    <div className="bg-[rgba(255,255,255,0.85)] h-[48px] relative rounded-[16px] shadow-[0px_4px_16px_0px_rgba(0,0,0,0.1)] shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex gap-[8px] items-center pl-[6px] relative size-full">
          <Button1 />
          <Button2 />
          <Button3 />
          <Button4 />
          <Button5 />
          <Button6 />
          <Button7 />
        </div>
      </div>
    </div>
  );
}

function Save() {
  return (
    <div className="absolute left-[20px] size-[16px] top-[14px]" data-name="Save">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Save">
          <path d={svgPaths.p3c401780} id="Vector" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p56b0600} id="Vector_2" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p17caa400} id="Vector_3" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Button8() {
  return (
    <div className="absolute bg-[rgba(255,255,255,0.6)] border-[0.8px] border-[rgba(255,255,255,0.5)] border-solid h-[45.6px] left-0 rounded-[12px] top-0 w-[154.1px]" data-name="button">
      <Save />
      <p className="-translate-x-1/2 absolute font-['Inter:Medium',sans-serif] font-medium leading-[24px] left-[88px] not-italic text-[#0a0a0a] text-[16px] text-center top-[7.8px]">Save Record</p>
    </div>
  );
}

function Upload() {
  return (
    <div className="absolute left-[20px] size-[16px] top-[14px]" data-name="Upload">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Upload">
          <path d={svgPaths.p23ad1400} id="Vector" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p26e09a00} id="Vector_2" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d="M8 2V10" id="Vector_3" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Button9() {
  return (
    <div className="absolute bg-[rgba(255,255,255,0.6)] border-[0.8px] border-[rgba(255,255,255,0.5)] border-solid h-[45.6px] left-[371.39px] rounded-[12px] top-0 w-[115.8px]" data-name="button">
      <Upload />
      <p className="-translate-x-1/2 absolute font-['Inter:Medium',sans-serif] font-medium leading-[24px] left-[69.5px] not-italic text-[#0a0a0a] text-[16px] text-center top-[7.8px]">Import</p>
    </div>
  );
}

function Download() {
  return (
    <div className="absolute left-[20px] size-[16px] top-[14px]" data-name="Download">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Download">
          <path d={svgPaths.p23ad1400} id="Vector" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p19411800} id="Vector_2" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d="M8 10V2" id="Vector_3" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Button10() {
  return (
    <div className="absolute bg-[rgba(255,255,255,0.6)] border-[0.8px] border-[rgba(255,255,255,0.5)] border-solid h-[45.6px] left-[495.19px] rounded-[12px] top-0 w-[182.813px]" data-name="button">
      <Download />
      <p className="-translate-x-1/2 absolute font-['Inter:Medium',sans-serif] font-medium leading-[24px] left-[103.5px] not-italic text-[#0a0a0a] text-[16px] text-center top-[7.8px]">Export JSON-LD</p>
    </div>
  );
}

function Database() {
  return (
    <div className="absolute left-[20px] size-[16px] top-[14px]" data-name="Database">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Database">
          <path d={svgPaths.p2b393280} id="Vector" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p3eea2890} id="Vector_2" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p2bdcbd80} id="Vector_3" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Button11() {
  return (
    <div className="absolute bg-[rgba(255,255,255,0.6)] border-[0.8px] border-[rgba(255,255,255,0.5)] border-solid h-[45.6px] left-[162.1px] rounded-[12px] top-0 w-[201.288px]" data-name="button">
      <Database />
      <p className="-translate-x-1/2 absolute font-['Inter:Medium',sans-serif] font-medium leading-[24px] left-[112px] not-italic text-[#0a0a0a] text-[16px] text-center top-[7.8px]">Load Real Example</p>
    </div>
  );
}

function Container5() {
  return (
    <div className="h-[45.6px] relative shrink-0 w-full" data-name="Container">
      <Button8 />
      <Button9 />
      <Button10 />
      <Button11 />
    </div>
  );
}

function Container() {
  return (
    <div className="absolute bg-[rgba(255,255,255,0.8)] content-stretch flex flex-col gap-[16px] h-[221.6px] items-start left-0 pb-[0.8px] pt-[16px] px-[24px] top-0 w-[1679.2px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-b-[0.8px] border-black border-solid inset-0 pointer-events-none shadow-[0px_2px_20px_0px_rgba(0,0,0,0.05)]" />
      <Container1 />
      <Container4 />
      <Container5 />
    </div>
  );
}

function FileText() {
  return (
    <div className="absolute left-[16px] size-[16px] top-[10px]" data-name="FileText">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="FileText">
          <path d={svgPaths.p19416e00} id="Vector" stroke="var(--stroke-0, #9810FA)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p3e059a80} id="Vector_2" stroke="var(--stroke-0, #9810FA)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d="M6.66667 6H5.33333" id="Vector_3" stroke="var(--stroke-0, #9810FA)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d="M10.6667 8.66667H5.33333" id="Vector_4" stroke="var(--stroke-0, #9810FA)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d="M10.6667 11.3333H5.33333" id="Vector_5" stroke="var(--stroke-0, #9810FA)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Button12() {
  return (
    <div className="bg-[rgba(255,255,255,0.95)] h-[36px] relative rounded-[12px] shadow-[0px_2px_8px_0px_rgba(0,0,0,0.1)] shrink-0 w-[88.988px]" data-name="button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <FileText />
        <p className="-translate-x-1/2 absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-[56px] not-italic text-[#9810fa] text-[14px] text-center top-[7.8px]">Form</p>
      </div>
      <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0px_1px_0px_0px_white]" />
    </div>
  );
}

function Network() {
  return (
    <div className="absolute left-[16px] size-[16px] top-[10px]" data-name="Network">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g clipPath="url(#clip0_524_4205)" id="Network">
          <path d={svgPaths.p2f327a00} id="Vector" stroke="var(--stroke-0, #364153)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p1cd74100} id="Vector_2" stroke="var(--stroke-0, #364153)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.pe9cb400} id="Vector_3" stroke="var(--stroke-0, #364153)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p345da6c0} id="Vector_4" stroke="var(--stroke-0, #364153)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d="M8 8V5.33333" id="Vector_5" stroke="var(--stroke-0, #364153)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
        <defs>
          <clipPath id="clip0_524_4205">
            <rect fill="white" height="16" width="16" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Button13() {
  return (
    <div className="h-[36px] relative rounded-[20px] shrink-0 w-[158.838px]" data-name="button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Network />
        <p className="-translate-x-1/2 absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-[91.5px] not-italic text-[#364153] text-[14px] text-center top-[7.8px]">Authority Graph</p>
      </div>
    </div>
  );
}

function Database1() {
  return (
    <div className="absolute left-[16px] size-[16px] top-[10px]" data-name="Database">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Database">
          <path d={svgPaths.p2b393280} id="Vector" stroke="var(--stroke-0, #364153)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p3eea2890} id="Vector_2" stroke="var(--stroke-0, #364153)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p2bdcbd80} id="Vector_3" stroke="var(--stroke-0, #364153)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Button14() {
  return (
    <div className="h-[36px] relative rounded-[20px] shrink-0 w-[95.588px]" data-name="button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Database1 />
        <p className="-translate-x-1/2 absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-[60px] not-italic text-[#364153] text-[14px] text-center top-[7.8px]">MARC</p>
      </div>
    </div>
  );
}

function Code() {
  return (
    <div className="absolute left-[16px] size-[16px] top-[10px]" data-name="Code">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Code">
          <path d={svgPaths.p110bf000} id="Vector" stroke="var(--stroke-0, #364153)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p2d665f00} id="Vector_2" stroke="var(--stroke-0, #364153)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Button15() {
  return (
    <div className="h-[36px] relative rounded-[20px] shrink-0 w-[81.8px]" data-name="button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Code />
        <p className="-translate-x-1/2 absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-[53px] not-italic text-[#364153] text-[14px] text-center top-[7.8px]">RDF</p>
      </div>
    </div>
  );
}

function Braces() {
  return (
    <div className="absolute left-[16px] size-[16px] top-[10px]" data-name="Braces">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Braces">
          <path d={svgPaths.p35513100} id="Vector" stroke="var(--stroke-0, #364153)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p250d35c0} id="Vector_2" stroke="var(--stroke-0, #364153)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Button16() {
  return (
    <div className="h-[36px] relative rounded-[20px] shrink-0 w-[90.5px]" data-name="button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Braces />
        <p className="-translate-x-1/2 absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-[57px] not-italic text-[#364153] text-[14px] text-center top-[7.8px]">JSON</p>
      </div>
    </div>
  );
}

function Eye() {
  return (
    <div className="absolute left-[16px] size-[16px] top-[10px]" data-name="Eye">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Eye">
          <path d={svgPaths.pad05c0} id="Vector" stroke="var(--stroke-0, #364153)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p28db2b80} id="Vector_2" stroke="var(--stroke-0, #364153)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Button17() {
  return (
    <div className="h-[36px] relative rounded-[20px] shrink-0 w-[154.313px]" data-name="button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Eye />
        <p className="-translate-x-1/2 absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-[89px] not-italic text-[#364153] text-[14px] text-center top-[7.8px]">Preview (OPAC)</p>
      </div>
    </div>
  );
}

function Sparkles() {
  return (
    <div className="absolute left-[16px] size-[16px] top-[10px]" data-name="Sparkles">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g clipPath="url(#clip0_524_4184)" id="Sparkles">
          <path d={svgPaths.p874e300} id="Vector" stroke="var(--stroke-0, #364153)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d="M13.3333 2V4.66667" id="Vector_2" stroke="var(--stroke-0, #364153)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d="M14.6667 3.33333H12" id="Vector_3" stroke="var(--stroke-0, #364153)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d="M2.66667 11.3333V12.6667" id="Vector_4" stroke="var(--stroke-0, #364153)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d="M3.33333 12H2" id="Vector_5" stroke="var(--stroke-0, #364153)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
        <defs>
          <clipPath id="clip0_524_4184">
            <rect fill="white" height="16" width="16" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Button18() {
  return (
    <div className="h-[36px] relative rounded-[20px] shrink-0 w-[121.738px]" data-name="button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Sparkles />
        <p className="-translate-x-1/2 absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-[73.5px] not-italic text-[#364153] text-[14px] text-center top-[7.8px]">Mind Map</p>
      </div>
    </div>
  );
}

function Container7() {
  return (
    <div className="bg-[rgba(255,255,255,0.85)] h-[48px] relative rounded-[16px] shadow-[0px_4px_16px_0px_rgba(0,0,0,0.1)] shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex gap-[8px] items-center pl-[6px] relative size-full">
          <Button12 />
          <Button13 />
          <Button14 />
          <Button15 />
          <Button16 />
          <Button17 />
          <Button18 />
        </div>
      </div>
    </div>
  );
}

function Container6() {
  return (
    <div className="absolute bg-[rgba(255,255,255,0.8)] content-stretch flex flex-col h-[73.6px] items-start left-0 pb-[0.8px] pt-[12.8px] px-[24px] top-[222.4px] w-[1679.2px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[rgba(255,255,255,0.2)] border-b-[0.8px] border-solid border-t-[0.8px] inset-0 pointer-events-none shadow-[0px_2px_20px_0px_rgba(0,0,0,0.05)]" />
      <Container7 />
    </div>
  );
}

function BookOpen() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="BookOpen">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="BookOpen">
          <path d="M10 5.83333V17.5" id="Vector" stroke="var(--stroke-0, #155DFC)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d={svgPaths.p25713000} id="Vector_2" stroke="var(--stroke-0, #155DFC)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
        </g>
      </svg>
    </div>
  );
}

function H1() {
  return (
    <div className="h-[28px] relative shrink-0 w-[49.338px]" data-name="h3">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Bold',sans-serif] font-bold leading-[28px] left-0 not-italic text-[#0a0a0a] text-[20px] top-[-1.2px] tracking-[-0.4px]">Work</p>
      </div>
    </div>
  );
}

function Container11() {
  return (
    <div className="content-stretch flex gap-[8px] h-[28px] items-center relative shrink-0 w-full" data-name="Container">
      <BookOpen />
      <H1 />
    </div>
  );
}

function Span() {
  return (
    <div className="absolute h-[20px] left-[39.54px] top-0 w-[6.088px]" data-name="span">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-0 not-italic text-[#fb2c36] text-[14px] top-[-0.2px]">*</p>
    </div>
  );
}

function Label() {
  return (
    <div className="h-[20px] relative shrink-0 w-[45.625px]" data-name="Label">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-0 not-italic text-[#0a0a0a] text-[14px] top-[-0.2px]">Title</p>
        <Span />
      </div>
    </div>
  );
}

function Badge() {
  return (
    <div className="h-[21.587px] relative rounded-[14px] shrink-0 w-[37.4px]" data-name="Badge">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center overflow-clip px-[8.8px] py-[2.8px] relative rounded-[inherit] size-full">
        <p className="font-['Consolas:Medium',sans-serif] leading-[16px] not-italic relative shrink-0 text-[#0a0a0a] text-[12px]">130</p>
      </div>
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[14px]" />
    </div>
  );
}

function Container15() {
  return (
    <div className="h-[21.587px] relative shrink-0 w-[91.025px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] items-center relative size-full">
        <Label />
        <Badge />
      </div>
    </div>
  );
}

function HelpCircle() {
  return (
    <div className="h-[16px] overflow-clip relative shrink-0 w-full" data-name="HelpCircle">
      <div className="absolute inset-[8.33%]" data-name="Vector">
        <div className="absolute inset-[-5%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14.6667 14.6667">
            <path d={svgPaths.p3d62dd80} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[29.15%_37.83%_45.83%_37.87%]" data-name="Vector">
        <div className="absolute inset-[-16.65%_-17.15%_-16.66%_-17.16%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5.22018 5.3365">
            <path d={svgPaths.pb91f080} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
      <div className="absolute bottom-[29.17%] left-1/2 right-[49.96%] top-[70.83%]" data-name="Vector">
        <div className="absolute inset-[-0.67px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1.34 1.33333">
            <path d="M0.666667 0.666667H0.673334" id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Button19() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <HelpCircle />
      </div>
    </div>
  );
}

function Container14() {
  return (
    <div className="h-[21.587px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between relative size-full">
          <Container15 />
          <Button19 />
        </div>
      </div>
    </div>
  );
}

function Container16() {
  return (
    <div className="h-[18px] overflow-clip relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Consolas:Regular',sans-serif] leading-[18px] left-0 not-italic text-[#6a7282] text-[12px] top-[-0.4px]">bf:title</p>
    </div>
  );
}

function Label1() {
  return (
    <div className="content-stretch flex h-[20px] items-center relative shrink-0 w-full" data-name="Label">
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[20px] not-italic relative shrink-0 text-[#4a5565] text-[14px]">Main Title</p>
    </div>
  );
}

function Input() {
  return (
    <div className="bg-[#f3f3f5] h-[36px] relative rounded-[14px] shrink-0 w-full" data-name="Input">
      <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex items-center px-[12px] py-[4px] relative size-full">
          <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#717182] text-[14px]">Main title of the work</p>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[14px]" />
    </div>
  );
}

function Container18() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] h-[60px] items-start relative shrink-0 w-full" data-name="Container">
      <Label1 />
      <Input />
    </div>
  );
}

function Label2() {
  return (
    <div className="content-stretch flex h-[20px] items-center relative shrink-0 w-full" data-name="Label">
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[20px] not-italic relative shrink-0 text-[#4a5565] text-[14px]">Subtitle (optional)</p>
    </div>
  );
}

function Input1() {
  return (
    <div className="bg-[#f3f3f5] h-[36px] relative rounded-[14px] shrink-0 w-full" data-name="Input">
      <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex items-center px-[12px] py-[4px] relative size-full">
          <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#717182] text-[14px]">Subtitle if applicable</p>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[14px]" />
    </div>
  );
}

function Container19() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] h-[60px] items-start relative shrink-0 w-full" data-name="Container">
      <Label2 />
      <Input1 />
    </div>
  );
}

function Container17() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] h-[132px] items-start relative shrink-0 w-full" data-name="Container">
      <Container18 />
      <Container19 />
    </div>
  );
}

function Container13() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] h-[187.588px] items-start relative shrink-0 w-full" data-name="Container">
      <Container14 />
      <Container16 />
      <Container17 />
    </div>
  );
}

function Label3() {
  return (
    <div className="h-[20px] relative shrink-0 w-[80.975px]" data-name="Label">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center relative size-full">
        <p className="font-['Inter:Medium',sans-serif] font-medium leading-[20px] not-italic relative shrink-0 text-[#0a0a0a] text-[14px]">Contribution</p>
      </div>
    </div>
  );
}

function Badge1() {
  return (
    <div className="h-[21.587px] relative rounded-[14px] shrink-0 w-[37.4px]" data-name="Badge">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center overflow-clip px-[8.8px] py-[2.8px] relative rounded-[inherit] size-full">
        <p className="font-['Consolas:Medium',sans-serif] leading-[16px] not-italic relative shrink-0 text-[#0a0a0a] text-[12px]">100</p>
      </div>
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[14px]" />
    </div>
  );
}

function Badge2() {
  return (
    <div className="bg-[#eceef2] h-[21.587px] relative rounded-[14px] shrink-0 w-[85.563px]" data-name="Badge">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center overflow-clip px-[8.8px] py-[2.8px] relative rounded-[inherit] size-full">
        <p className="font-['Inter:Medium',sans-serif] font-medium leading-[16px] not-italic relative shrink-0 text-[#030213] text-[12px]">LOC-NAMES</p>
      </div>
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[14px]" />
    </div>
  );
}

function Badge3() {
  return (
    <div className="bg-[#155dfc] h-[21.587px] relative rounded-[14px] shrink-0 w-[40.788px]" data-name="Badge">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center overflow-clip px-[8.8px] py-[2.8px] relative rounded-[inherit] size-full">
        <p className="font-['Inter:Medium',sans-serif] font-medium leading-[16px] not-italic relative shrink-0 text-[12px] text-white">LOD</p>
      </div>
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[14px]" />
    </div>
  );
}

function Container22() {
  return (
    <div className="h-[21.587px] relative shrink-0 w-[268.725px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] items-center relative size-full">
        <Label3 />
        <Badge1 />
        <Badge2 />
        <Badge3 />
      </div>
    </div>
  );
}

function HelpCircle1() {
  return (
    <div className="h-[16px] overflow-clip relative shrink-0 w-full" data-name="HelpCircle">
      <div className="absolute inset-[8.33%]" data-name="Vector">
        <div className="absolute inset-[-5%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14.6667 14.6667">
            <path d={svgPaths.p3d62dd80} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[29.15%_37.83%_45.83%_37.87%]" data-name="Vector">
        <div className="absolute inset-[-16.65%_-17.15%_-16.66%_-17.16%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5.22018 5.3365">
            <path d={svgPaths.pb91f080} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
      <div className="absolute bottom-[29.17%] left-1/2 right-[49.96%] top-[70.83%]" data-name="Vector">
        <div className="absolute inset-[-0.67px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1.34 1.33333">
            <path d="M0.666667 0.666667H0.673334" id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Button20() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <HelpCircle1 />
      </div>
    </div>
  );
}

function Container21() {
  return (
    <div className="h-[21.587px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between relative size-full">
          <Container22 />
          <Button20 />
        </div>
      </div>
    </div>
  );
}

function Container23() {
  return (
    <div className="h-[18px] overflow-clip relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Consolas:Regular',sans-serif] leading-[18px] left-0 not-italic text-[#6a7282] text-[12px] top-[-0.4px]">bf:contribution</p>
    </div>
  );
}

function Option() {
  return <div className="h-0 shrink-0 w-full" data-name="option" />;
}

function Option1() {
  return <div className="h-0 shrink-0 w-full" data-name="option" />;
}

function Option2() {
  return <div className="h-0 shrink-0 w-full" data-name="option" />;
}

function Option3() {
  return <div className="h-0 shrink-0 w-full" data-name="option" />;
}

function Option4() {
  return <div className="h-0 shrink-0 w-full" data-name="option" />;
}

function Option5() {
  return <div className="h-0 shrink-0 w-full" data-name="option" />;
}

function Option6() {
  return <div className="h-0 shrink-0 w-full" data-name="option" />;
}

function Option7() {
  return <div className="h-0 shrink-0 w-full" data-name="option" />;
}

function Option8() {
  return <div className="h-0 shrink-0 w-full" data-name="option" />;
}

function Option9() {
  return <div className="h-0 shrink-0 w-full" data-name="option" />;
}

function Option10() {
  return <div className="h-0 shrink-0 w-full" data-name="option" />;
}

function Option11() {
  return <div className="h-0 shrink-0 w-full" data-name="option" />;
}

function Select() {
  return (
    <div className="absolute content-stretch flex flex-col h-[36px] items-start left-[466px] pb-[0.8px] pl-[-514.8px] pr-[746.8px] pt-[-623.975px] rounded-[14px] top-0 w-[232px]" data-name="select">
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[14px]" />
      <Option />
      <Option1 />
      <Option2 />
      <Option3 />
      <Option4 />
      <Option5 />
      <Option6 />
      <Option7 />
      <Option8 />
      <Option9 />
      <Option10 />
      <Option11 />
    </div>
  );
}

function Search() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Search">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Search">
          <path d={svgPaths.p107a080} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d="M14 14L11.1333 11.1333" id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Button21() {
  return (
    <div className="absolute bg-[#030213] content-stretch flex h-[32px] items-center justify-center left-[706px] rounded-[14px] top-0 w-[36px]" data-name="Button">
      <Search />
    </div>
  );
}

function Input2() {
  return (
    <div className="absolute bg-[#f3f3f5] h-[36px] left-0 rounded-[14px] top-0 w-[458px]" data-name="Input">
      <div className="content-stretch flex items-center overflow-clip px-[12px] py-[4px] relative rounded-[inherit] size-full">
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#717182] text-[14px]">Search LOC Name Authority File...</p>
      </div>
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[14px]" />
    </div>
  );
}

function Search1() {
  return (
    <div className="absolute left-[12px] size-[16px] top-[10px]" data-name="Search">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Search">
          <path d={svgPaths.p107a080} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d="M14 14L11.1333 11.1333" id="Vector_2" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Container25() {
  return (
    <div className="absolute h-[36px] left-0 top-0 w-[458px]" data-name="Container">
      <Input2 />
      <Search1 />
    </div>
  );
}

function Container24() {
  return (
    <div className="h-[36px] relative shrink-0 w-full" data-name="Container">
      <Select />
      <Button21 />
      <Container25 />
    </div>
  );
}

function Container20() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] h-[91.588px] items-start relative shrink-0 w-full" data-name="Container">
      <Container21 />
      <Container23 />
      <Container24 />
    </div>
  );
}

function Label4() {
  return (
    <div className="h-[20px] relative shrink-0 w-[46.975px]" data-name="Label">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center relative size-full">
        <p className="font-['Inter:Medium',sans-serif] font-medium leading-[20px] not-italic relative shrink-0 text-[#0a0a0a] text-[14px]">Subject</p>
      </div>
    </div>
  );
}

function Badge4() {
  return (
    <div className="h-[21.587px] relative rounded-[14px] shrink-0 w-[37.4px]" data-name="Badge">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center overflow-clip px-[8.8px] py-[2.8px] relative rounded-[inherit] size-full">
        <p className="font-['Consolas:Medium',sans-serif] leading-[16px] not-italic relative shrink-0 text-[#0a0a0a] text-[12px]">600</p>
      </div>
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[14px]" />
    </div>
  );
}

function Badge5() {
  return (
    <div className="bg-[#eceef2] flex-[1_0_0] h-[21.587px] min-h-px min-w-px relative rounded-[14px]" data-name="Badge">
      <div className="flex flex-row items-center justify-center overflow-clip rounded-[inherit] size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center px-[8.8px] py-[2.8px] relative size-full">
          <p className="font-['Inter:Medium',sans-serif] font-medium leading-[16px] not-italic relative shrink-0 text-[#030213] text-[12px]">LOC-SUBJECTS</p>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[14px]" />
    </div>
  );
}

function Badge6() {
  return (
    <div className="bg-[#155dfc] h-[21.587px] relative rounded-[14px] shrink-0 w-[40.788px]" data-name="Badge">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center overflow-clip px-[8.8px] py-[2.8px] relative rounded-[inherit] size-full">
        <p className="font-['Inter:Medium',sans-serif] font-medium leading-[16px] not-italic relative shrink-0 text-[12px] text-white">LOD</p>
      </div>
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[14px]" />
    </div>
  );
}

function Container28() {
  return (
    <div className="h-[21.587px] relative shrink-0 w-[247.413px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] items-center relative size-full">
        <Label4 />
        <Badge4 />
        <Badge5 />
        <Badge6 />
      </div>
    </div>
  );
}

function HelpCircle2() {
  return (
    <div className="h-[16px] overflow-clip relative shrink-0 w-full" data-name="HelpCircle">
      <div className="absolute inset-[8.33%]" data-name="Vector">
        <div className="absolute inset-[-5%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14.6667 14.6667">
            <path d={svgPaths.p3d62dd80} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[29.15%_37.83%_45.83%_37.87%]" data-name="Vector">
        <div className="absolute inset-[-16.65%_-17.15%_-16.66%_-17.16%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5.22018 5.3365">
            <path d={svgPaths.pb91f080} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
      <div className="absolute bottom-[29.17%] left-1/2 right-[49.96%] top-[70.83%]" data-name="Vector">
        <div className="absolute inset-[-0.67px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1.34 1.33333">
            <path d="M0.666667 0.666667H0.673334" id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Button22() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <HelpCircle2 />
      </div>
    </div>
  );
}

function Container27() {
  return (
    <div className="h-[21.587px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between relative size-full">
          <Container28 />
          <Button22 />
        </div>
      </div>
    </div>
  );
}

function Container29() {
  return (
    <div className="h-[18px] overflow-clip relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Consolas:Regular',sans-serif] leading-[18px] left-0 not-italic text-[#6a7282] text-[12px] top-[-0.4px]">bf:subject</p>
    </div>
  );
}

function Search2() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Search">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Search">
          <path d={svgPaths.p107a080} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d="M14 14L11.1333 11.1333" id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Button23() {
  return (
    <div className="absolute bg-[#030213] content-stretch flex h-[32px] items-center justify-center left-[706px] rounded-[14px] top-0 w-[36px]" data-name="Button">
      <Search2 />
    </div>
  );
}

function Input3() {
  return (
    <div className="absolute bg-[#f3f3f5] h-[36px] left-0 rounded-[14px] top-0 w-[698px]" data-name="Input">
      <div className="content-stretch flex items-center overflow-clip px-[12px] py-[4px] relative rounded-[inherit] size-full">
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#717182] text-[14px]">Search Library of Congress Subject Headings...</p>
      </div>
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[14px]" />
    </div>
  );
}

function Search3() {
  return (
    <div className="absolute left-[12px] size-[16px] top-[10px]" data-name="Search">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Search">
          <path d={svgPaths.p107a080} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d="M14 14L11.1333 11.1333" id="Vector_2" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Container31() {
  return (
    <div className="absolute h-[36px] left-0 top-0 w-[698px]" data-name="Container">
      <Input3 />
      <Search3 />
    </div>
  );
}

function Container30() {
  return (
    <div className="h-[36px] relative shrink-0 w-full" data-name="Container">
      <Button23 />
      <Container31 />
    </div>
  );
}

function Container26() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] h-[91.588px] items-start relative shrink-0 w-full" data-name="Container">
      <Container27 />
      <Container29 />
      <Container30 />
    </div>
  );
}

function Label5() {
  return (
    <div className="h-[20px] relative shrink-0 w-[83.013px]" data-name="Label">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center relative size-full">
        <p className="font-['Inter:Medium',sans-serif] font-medium leading-[20px] not-italic relative shrink-0 text-[#0a0a0a] text-[14px]">Classification</p>
      </div>
    </div>
  );
}

function Badge7() {
  return (
    <div className="h-[21.587px] relative rounded-[14px] shrink-0 w-[37.4px]" data-name="Badge">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center overflow-clip px-[8.8px] py-[2.8px] relative rounded-[inherit] size-full">
        <p className="font-['Consolas:Medium',sans-serif] leading-[16px] not-italic relative shrink-0 text-[#0a0a0a] text-[12px]">050</p>
      </div>
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[14px]" />
    </div>
  );
}

function Badge8() {
  return (
    <div className="bg-[#eceef2] h-[21.587px] relative rounded-[14px] shrink-0 w-[135.288px]" data-name="Badge">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center overflow-clip px-[8.8px] py-[2.8px] relative rounded-[inherit] size-full">
        <p className="font-['Inter:Medium',sans-serif] font-medium leading-[16px] not-italic relative shrink-0 text-[#030213] text-[12px]">LOC-CLASSIFICATION</p>
      </div>
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[14px]" />
    </div>
  );
}

function Badge9() {
  return (
    <div className="bg-[#155dfc] h-[21.587px] relative rounded-[14px] shrink-0 w-[40.788px]" data-name="Badge">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center overflow-clip px-[8.8px] py-[2.8px] relative rounded-[inherit] size-full">
        <p className="font-['Inter:Medium',sans-serif] font-medium leading-[16px] not-italic relative shrink-0 text-[12px] text-white">LOD</p>
      </div>
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[14px]" />
    </div>
  );
}

function Container34() {
  return (
    <div className="h-[21.587px] relative shrink-0 w-[320.488px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] items-center relative size-full">
        <Label5 />
        <Badge7 />
        <Badge8 />
        <Badge9 />
      </div>
    </div>
  );
}

function HelpCircle3() {
  return (
    <div className="h-[16px] overflow-clip relative shrink-0 w-full" data-name="HelpCircle">
      <div className="absolute inset-[8.33%]" data-name="Vector">
        <div className="absolute inset-[-5%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14.6667 14.6667">
            <path d={svgPaths.p3d62dd80} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[29.15%_37.83%_45.83%_37.87%]" data-name="Vector">
        <div className="absolute inset-[-16.65%_-17.15%_-16.66%_-17.16%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5.22018 5.3365">
            <path d={svgPaths.pb91f080} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
      <div className="absolute bottom-[29.17%] left-1/2 right-[49.96%] top-[70.83%]" data-name="Vector">
        <div className="absolute inset-[-0.67px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1.34 1.33333">
            <path d="M0.666667 0.666667H0.673334" id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Button24() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <HelpCircle3 />
      </div>
    </div>
  );
}

function Container33() {
  return (
    <div className="h-[21.587px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between relative size-full">
          <Container34 />
          <Button24 />
        </div>
      </div>
    </div>
  );
}

function Container35() {
  return (
    <div className="h-[18px] overflow-clip relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Consolas:Regular',sans-serif] leading-[18px] left-0 not-italic text-[#6a7282] text-[12px] top-[-0.4px]">bf:classification</p>
    </div>
  );
}

function Plus() {
  return (
    <div className="absolute left-[284.65px] size-[16px] top-[8px]" data-name="Plus">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Plus">
          <path d="M3.33333 8H12.6667" id="Vector" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d="M8 3.33333V12.6667" id="Vector_2" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Button25() {
  return (
    <div className="bg-white h-[32px] relative rounded-[14px] shrink-0 w-full" data-name="Button">
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[14px]" />
      <Plus />
      <p className="-translate-x-1/2 absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[20px] left-[386.15px] not-italic text-[#0a0a0a] text-[14px] text-center top-[5.8px] tracking-[-0.14px]">Add DDC Classification</p>
    </div>
  );
}

function Container32() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] h-[87.588px] items-start relative shrink-0 w-full" data-name="Container">
      <Container33 />
      <Container35 />
      <Button25 />
    </div>
  );
}

function Label6() {
  return (
    <div className="h-[20px] relative shrink-0 w-[137.012px]" data-name="Label">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center relative size-full">
        <p className="font-['Inter:Medium',sans-serif] font-medium leading-[20px] not-italic relative shrink-0 text-[#0a0a0a] text-[14px]">Geographic Coverage</p>
      </div>
    </div>
  );
}

function Badge10() {
  return (
    <div className="h-[21.587px] relative rounded-[14px] shrink-0 w-[37.4px]" data-name="Badge">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center overflow-clip px-[8.8px] py-[2.8px] relative rounded-[inherit] size-full">
        <p className="font-['Consolas:Medium',sans-serif] leading-[16px] not-italic relative shrink-0 text-[#0a0a0a] text-[12px]">043</p>
      </div>
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[14px]" />
    </div>
  );
}

function Badge11() {
  return (
    <div className="bg-[#eceef2] h-[21.587px] relative rounded-[14px] shrink-0 w-[85.738px]" data-name="Badge">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center overflow-clip px-[8.8px] py-[2.8px] relative rounded-[inherit] size-full">
        <p className="font-['Inter:Medium',sans-serif] font-medium leading-[16px] not-italic relative shrink-0 text-[#030213] text-[12px]">LOC-PLACES</p>
      </div>
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[14px]" />
    </div>
  );
}

function Badge12() {
  return (
    <div className="bg-[#155dfc] h-[21.587px] relative rounded-[14px] shrink-0 w-[40.788px]" data-name="Badge">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center overflow-clip px-[8.8px] py-[2.8px] relative rounded-[inherit] size-full">
        <p className="font-['Inter:Medium',sans-serif] font-medium leading-[16px] not-italic relative shrink-0 text-[12px] text-white">LOD</p>
      </div>
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[14px]" />
    </div>
  );
}

function Container38() {
  return (
    <div className="h-[21.587px] relative shrink-0 w-[324.938px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] items-center relative size-full">
        <Label6 />
        <Badge10 />
        <Badge11 />
        <Badge12 />
      </div>
    </div>
  );
}

function HelpCircle4() {
  return (
    <div className="h-[16px] overflow-clip relative shrink-0 w-full" data-name="HelpCircle">
      <div className="absolute inset-[8.33%]" data-name="Vector">
        <div className="absolute inset-[-5%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14.6667 14.6667">
            <path d={svgPaths.p3d62dd80} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[29.15%_37.83%_45.83%_37.87%]" data-name="Vector">
        <div className="absolute inset-[-16.65%_-17.15%_-16.66%_-17.16%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5.22018 5.3365">
            <path d={svgPaths.pb91f080} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
      <div className="absolute bottom-[29.17%] left-1/2 right-[49.96%] top-[70.83%]" data-name="Vector">
        <div className="absolute inset-[-0.67px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1.34 1.33333">
            <path d="M0.666667 0.666667H0.673334" id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Button26() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <HelpCircle4 />
      </div>
    </div>
  );
}

function Container37() {
  return (
    <div className="h-[21.587px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between relative size-full">
          <Container38 />
          <Button26 />
        </div>
      </div>
    </div>
  );
}

function Container39() {
  return (
    <div className="h-[18px] overflow-clip relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Consolas:Regular',sans-serif] leading-[18px] left-0 not-italic text-[#6a7282] text-[12px] top-[-0.4px]">bf:geographicCoverage</p>
    </div>
  );
}

function Search4() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Search">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Search">
          <path d={svgPaths.p107a080} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d="M14 14L11.1333 11.1333" id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Button27() {
  return (
    <div className="absolute bg-[#030213] content-stretch flex h-[32px] items-center justify-center left-[706px] rounded-[14px] top-0 w-[36px]" data-name="Button">
      <Search4 />
    </div>
  );
}

function Input4() {
  return (
    <div className="absolute bg-[#f3f3f5] h-[36px] left-0 rounded-[14px] top-0 w-[698px]" data-name="Input">
      <div className="content-stretch flex items-center overflow-clip px-[12px] py-[4px] relative rounded-[inherit] size-full">
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#717182] text-[14px]">Search geographic names...</p>
      </div>
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[14px]" />
    </div>
  );
}

function Search5() {
  return (
    <div className="absolute left-[12px] size-[16px] top-[10px]" data-name="Search">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Search">
          <path d={svgPaths.p107a080} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d="M14 14L11.1333 11.1333" id="Vector_2" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Container41() {
  return (
    <div className="absolute h-[36px] left-0 top-0 w-[698px]" data-name="Container">
      <Input4 />
      <Search5 />
    </div>
  );
}

function Container40() {
  return (
    <div className="h-[36px] relative shrink-0 w-full" data-name="Container">
      <Button27 />
      <Container41 />
    </div>
  );
}

function Container36() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] h-[91.588px] items-start relative shrink-0 w-full" data-name="Container">
      <Container37 />
      <Container39 />
      <Container40 />
    </div>
  );
}

function Label7() {
  return (
    <div className="flex-[1_0_0] h-[20px] min-h-px min-w-px relative" data-name="Label">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center relative size-full">
        <p className="font-['Inter:Medium',sans-serif] font-medium leading-[20px] not-italic relative shrink-0 text-[#0a0a0a] text-[14px]">Language</p>
      </div>
    </div>
  );
}

function Badge13() {
  return (
    <div className="h-[21.587px] relative rounded-[14px] shrink-0 w-[37.4px]" data-name="Badge">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center overflow-clip px-[8.8px] py-[2.8px] relative rounded-[inherit] size-full">
        <p className="font-['Consolas:Medium',sans-serif] leading-[16px] not-italic relative shrink-0 text-[#0a0a0a] text-[12px]">041</p>
      </div>
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[14px]" />
    </div>
  );
}

function Badge14() {
  return (
    <div className="bg-[#eceef2] h-[21.587px] relative rounded-[14px] shrink-0 w-[56.763px]" data-name="Badge">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center overflow-clip px-[8.8px] py-[2.8px] relative rounded-[inherit] size-full">
        <p className="font-['Inter:Medium',sans-serif] font-medium leading-[16px] not-italic relative shrink-0 text-[#030213] text-[12px]">ISO639</p>
      </div>
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[14px]" />
    </div>
  );
}

function Badge15() {
  return (
    <div className="bg-[#155dfc] h-[21.587px] relative rounded-[14px] shrink-0 w-[40.788px]" data-name="Badge">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center overflow-clip px-[8.8px] py-[2.8px] relative rounded-[inherit] size-full">
        <p className="font-['Inter:Medium',sans-serif] font-medium leading-[16px] not-italic relative shrink-0 text-[12px] text-white">LOD</p>
      </div>
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[14px]" />
    </div>
  );
}

function Container44() {
  return (
    <div className="h-[21.587px] relative shrink-0 w-[221.063px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] items-center relative size-full">
        <Label7 />
        <Badge13 />
        <Badge14 />
        <Badge15 />
      </div>
    </div>
  );
}

function HelpCircle5() {
  return (
    <div className="h-[16px] overflow-clip relative shrink-0 w-full" data-name="HelpCircle">
      <div className="absolute inset-[8.33%]" data-name="Vector">
        <div className="absolute inset-[-5%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14.6667 14.6667">
            <path d={svgPaths.p3d62dd80} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[29.15%_37.83%_45.83%_37.87%]" data-name="Vector">
        <div className="absolute inset-[-16.65%_-17.15%_-16.66%_-17.16%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5.22018 5.3365">
            <path d={svgPaths.pb91f080} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
      <div className="absolute bottom-[29.17%] left-1/2 right-[49.96%] top-[70.83%]" data-name="Vector">
        <div className="absolute inset-[-0.67px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1.34 1.33333">
            <path d="M0.666667 0.666667H0.673334" id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Button28() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <HelpCircle5 />
      </div>
    </div>
  );
}

function Container43() {
  return (
    <div className="h-[21.587px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between relative size-full">
          <Container44 />
          <Button28 />
        </div>
      </div>
    </div>
  );
}

function Container45() {
  return (
    <div className="h-[18px] overflow-clip relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Consolas:Regular',sans-serif] leading-[18px] left-0 not-italic text-[#6a7282] text-[12px] top-[-0.4px]">bf:language</p>
    </div>
  );
}

function Option12() {
  return <div className="absolute left-[-48.8px] size-0 top-[-1050.33px]" data-name="option" />;
}

function Option13() {
  return <div className="absolute left-[-48.8px] size-0 top-[-1050.33px]" data-name="option" />;
}

function Option14() {
  return <div className="absolute left-[-48.8px] size-0 top-[-1050.33px]" data-name="option" />;
}

function Option15() {
  return <div className="absolute left-[-48.8px] size-0 top-[-1050.33px]" data-name="option" />;
}

function Option16() {
  return <div className="absolute left-[-48.8px] size-0 top-[-1050.33px]" data-name="option" />;
}

function Option17() {
  return <div className="absolute left-[-48.8px] size-0 top-[-1050.33px]" data-name="option" />;
}

function Option18() {
  return <div className="absolute left-[-48.8px] size-0 top-[-1050.33px]" data-name="option" />;
}

function Option19() {
  return <div className="absolute left-[-48.8px] size-0 top-[-1050.33px]" data-name="option" />;
}

function Select1() {
  return (
    <div className="h-[40.8px] relative rounded-[14px] shrink-0 w-full" data-name="select">
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[14px]" />
      <Option12 />
      <Option13 />
      <Option14 />
      <Option15 />
      <Option16 />
      <Option17 />
      <Option18 />
      <Option19 />
    </div>
  );
}

function Container42() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] h-[96.388px] items-start relative shrink-0 w-full" data-name="Container">
      <Container43 />
      <Container45 />
      <Select1 />
    </div>
  );
}

function Label8() {
  return (
    <div className="h-[20px] relative shrink-0 w-[84.725px]" data-name="Label">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center relative size-full">
        <p className="font-['Inter:Medium',sans-serif] font-medium leading-[20px] not-italic relative shrink-0 text-[#0a0a0a] text-[14px]">Content Type</p>
      </div>
    </div>
  );
}

function Badge16() {
  return (
    <div className="h-[21.587px] relative rounded-[14px] shrink-0 w-[37.4px]" data-name="Badge">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center overflow-clip px-[8.8px] py-[2.8px] relative rounded-[inherit] size-full">
        <p className="font-['Consolas:Medium',sans-serif] leading-[16px] not-italic relative shrink-0 text-[#0a0a0a] text-[12px]">336</p>
      </div>
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[14px]" />
    </div>
  );
}

function Badge17() {
  return (
    <div className="bg-[#eceef2] h-[21.587px] relative rounded-[14px] shrink-0 w-[85.85px]" data-name="Badge">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center overflow-clip px-[8.8px] py-[2.8px] relative rounded-[inherit] size-full">
        <p className="font-['Inter:Medium',sans-serif] font-medium leading-[16px] not-italic relative shrink-0 text-[#030213] text-[12px]">RDA-VOCAB</p>
      </div>
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[14px]" />
    </div>
  );
}

function Badge18() {
  return (
    <div className="bg-[#155dfc] h-[21.587px] relative rounded-[14px] shrink-0 w-[40.788px]" data-name="Badge">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center overflow-clip px-[8.8px] py-[2.8px] relative rounded-[inherit] size-full">
        <p className="font-['Inter:Medium',sans-serif] font-medium leading-[16px] not-italic relative shrink-0 text-[12px] text-white">LOD</p>
      </div>
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[14px]" />
    </div>
  );
}

function Container48() {
  return (
    <div className="h-[21.587px] relative shrink-0 w-[272.763px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] items-center relative size-full">
        <Label8 />
        <Badge16 />
        <Badge17 />
        <Badge18 />
      </div>
    </div>
  );
}

function HelpCircle6() {
  return (
    <div className="h-[16px] overflow-clip relative shrink-0 w-full" data-name="HelpCircle">
      <div className="absolute inset-[8.33%]" data-name="Vector">
        <div className="absolute inset-[-5%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14.6667 14.6667">
            <path d={svgPaths.p3d62dd80} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[29.15%_37.83%_45.83%_37.87%]" data-name="Vector">
        <div className="absolute inset-[-16.65%_-17.15%_-16.66%_-17.16%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5.22018 5.3365">
            <path d={svgPaths.pb91f080} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
      <div className="absolute bottom-[29.17%] left-1/2 right-[49.96%] top-[70.83%]" data-name="Vector">
        <div className="absolute inset-[-0.67px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1.34 1.33333">
            <path d="M0.666667 0.666667H0.673334" id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Button29() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <HelpCircle6 />
      </div>
    </div>
  );
}

function Container47() {
  return (
    <div className="h-[21.587px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between relative size-full">
          <Container48 />
          <Button29 />
        </div>
      </div>
    </div>
  );
}

function Container49() {
  return (
    <div className="h-[18px] overflow-clip relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Consolas:Regular',sans-serif] leading-[18px] left-0 not-italic text-[#6a7282] text-[12px] top-[-0.4px]">bf:content</p>
    </div>
  );
}

function Option20() {
  return <div className="absolute left-[-48.8px] size-0 top-[-1162.71px]" data-name="option" />;
}

function Option21() {
  return <div className="absolute left-[-48.8px] size-0 top-[-1162.71px]" data-name="option" />;
}

function Option22() {
  return <div className="absolute left-[-48.8px] size-0 top-[-1162.71px]" data-name="option" />;
}

function Option23() {
  return <div className="absolute left-[-48.8px] size-0 top-[-1162.71px]" data-name="option" />;
}

function Option24() {
  return <div className="absolute left-[-48.8px] size-0 top-[-1162.71px]" data-name="option" />;
}

function Option25() {
  return <div className="absolute left-[-48.8px] size-0 top-[-1162.71px]" data-name="option" />;
}

function Option26() {
  return <div className="absolute left-[-48.8px] size-0 top-[-1162.71px]" data-name="option" />;
}

function Option27() {
  return <div className="absolute left-[-48.8px] size-0 top-[-1162.71px]" data-name="option" />;
}

function Option28() {
  return <div className="absolute left-[-48.8px] size-0 top-[-1162.71px]" data-name="option" />;
}

function Option29() {
  return <div className="absolute left-[-48.8px] size-0 top-[-1162.71px]" data-name="option" />;
}

function Option30() {
  return <div className="absolute left-[-48.8px] size-0 top-[-1162.71px]" data-name="option" />;
}

function Option31() {
  return <div className="absolute left-[-48.8px] size-0 top-[-1162.71px]" data-name="option" />;
}

function Option32() {
  return <div className="absolute left-[-48.8px] size-0 top-[-1162.71px]" data-name="option" />;
}

function Option33() {
  return <div className="absolute left-[-48.8px] size-0 top-[-1162.71px]" data-name="option" />;
}

function Option34() {
  return <div className="absolute left-[-48.8px] size-0 top-[-1162.71px]" data-name="option" />;
}

function Option35() {
  return <div className="absolute left-[-48.8px] size-0 top-[-1162.71px]" data-name="option" />;
}

function Option36() {
  return <div className="absolute left-[-48.8px] size-0 top-[-1162.71px]" data-name="option" />;
}

function Select2() {
  return (
    <div className="h-[40.8px] relative rounded-[14px] shrink-0 w-full" data-name="select">
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[14px]" />
      <Option20 />
      <Option21 />
      <Option22 />
      <Option23 />
      <Option24 />
      <Option25 />
      <Option26 />
      <Option27 />
      <Option28 />
      <Option29 />
      <Option30 />
      <Option31 />
      <Option32 />
      <Option33 />
      <Option34 />
      <Option35 />
      <Option36 />
    </div>
  );
}

function Container46() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] h-[96.388px] items-start relative shrink-0 w-full" data-name="Container">
      <Container47 />
      <Container49 />
      <Select2 />
    </div>
  );
}

function Label9() {
  return (
    <div className="h-[20px] relative shrink-0 w-[76.638px]" data-name="Label">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center relative size-full">
        <p className="font-['Inter:Medium',sans-serif] font-medium leading-[20px] not-italic relative shrink-0 text-[#0a0a0a] text-[14px]">Genre/Form</p>
      </div>
    </div>
  );
}

function Badge19() {
  return (
    <div className="h-[21.587px] relative rounded-[14px] shrink-0 w-[37.4px]" data-name="Badge">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center overflow-clip px-[8.8px] py-[2.8px] relative rounded-[inherit] size-full">
        <p className="font-['Consolas:Medium',sans-serif] leading-[16px] not-italic relative shrink-0 text-[#0a0a0a] text-[12px]">655</p>
      </div>
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[14px]" />
    </div>
  );
}

function Badge20() {
  return (
    <div className="bg-[#eceef2] h-[21.587px] relative rounded-[14px] shrink-0 w-[98.25px]" data-name="Badge">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center overflow-clip px-[8.8px] py-[2.8px] relative rounded-[inherit] size-full">
        <p className="font-['Inter:Medium',sans-serif] font-medium leading-[16px] not-italic relative shrink-0 text-[#030213] text-[12px]">LOC-SUBJECTS</p>
      </div>
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[14px]" />
    </div>
  );
}

function Badge21() {
  return (
    <div className="bg-[#155dfc] h-[21.587px] relative rounded-[14px] shrink-0 w-[40.788px]" data-name="Badge">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center overflow-clip px-[8.8px] py-[2.8px] relative rounded-[inherit] size-full">
        <p className="font-['Inter:Medium',sans-serif] font-medium leading-[16px] not-italic relative shrink-0 text-[12px] text-white">LOD</p>
      </div>
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[14px]" />
    </div>
  );
}

function Container52() {
  return (
    <div className="h-[21.587px] relative shrink-0 w-[277.075px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] items-center relative size-full">
        <Label9 />
        <Badge19 />
        <Badge20 />
        <Badge21 />
      </div>
    </div>
  );
}

function HelpCircle7() {
  return (
    <div className="h-[16px] overflow-clip relative shrink-0 w-full" data-name="HelpCircle">
      <div className="absolute inset-[8.33%]" data-name="Vector">
        <div className="absolute inset-[-5%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14.6667 14.6667">
            <path d={svgPaths.p3d62dd80} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[29.15%_37.83%_45.83%_37.87%]" data-name="Vector">
        <div className="absolute inset-[-16.65%_-17.15%_-16.66%_-17.16%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5.22018 5.3365">
            <path d={svgPaths.pb91f080} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
      <div className="absolute bottom-[29.17%] left-1/2 right-[49.96%] top-[70.83%]" data-name="Vector">
        <div className="absolute inset-[-0.67px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1.34 1.33333">
            <path d="M0.666667 0.666667H0.673334" id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Button30() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <HelpCircle7 />
      </div>
    </div>
  );
}

function Container51() {
  return (
    <div className="h-[21.587px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between relative size-full">
          <Container52 />
          <Button30 />
        </div>
      </div>
    </div>
  );
}

function Container53() {
  return (
    <div className="h-[18px] overflow-clip relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Consolas:Regular',sans-serif] leading-[18px] left-0 not-italic text-[#6a7282] text-[12px] top-[-0.4px]">bf:genreForm</p>
    </div>
  );
}

function Search6() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Search">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Search">
          <path d={svgPaths.p107a080} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d="M14 14L11.1333 11.1333" id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Button31() {
  return (
    <div className="absolute bg-[#030213] content-stretch flex h-[32px] items-center justify-center left-[706px] rounded-[14px] top-0 w-[36px]" data-name="Button">
      <Search6 />
    </div>
  );
}

function Input5() {
  return (
    <div className="absolute bg-[#f3f3f5] h-[36px] left-0 rounded-[14px] top-0 w-[698px]" data-name="Input">
      <div className="content-stretch flex items-center overflow-clip px-[12px] py-[4px] relative rounded-[inherit] size-full">
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#717182] text-[14px]">Search Library of Congress Subject Headings...</p>
      </div>
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[14px]" />
    </div>
  );
}

function Search7() {
  return (
    <div className="absolute left-[12px] size-[16px] top-[10px]" data-name="Search">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Search">
          <path d={svgPaths.p107a080} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d="M14 14L11.1333 11.1333" id="Vector_2" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Container55() {
  return (
    <div className="absolute h-[36px] left-0 top-0 w-[698px]" data-name="Container">
      <Input5 />
      <Search7 />
    </div>
  );
}

function Container54() {
  return (
    <div className="h-[36px] relative shrink-0 w-full" data-name="Container">
      <Button31 />
      <Container55 />
    </div>
  );
}

function Container50() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] h-[91.588px] items-start relative shrink-0 w-full" data-name="Container">
      <Container51 />
      <Container53 />
      <Container54 />
    </div>
  );
}

function Label10() {
  return (
    <div className="h-[20px] relative shrink-0 w-[73.3px]" data-name="Label">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center relative size-full">
        <p className="font-['Inter:Medium',sans-serif] font-medium leading-[20px] not-italic relative shrink-0 text-[#0a0a0a] text-[14px]">Origin Date</p>
      </div>
    </div>
  );
}

function Badge22() {
  return (
    <div className="h-[21.587px] relative rounded-[14px] shrink-0 w-[37.4px]" data-name="Badge">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center overflow-clip px-[8.8px] py-[2.8px] relative rounded-[inherit] size-full">
        <p className="font-['Consolas:Medium',sans-serif] leading-[16px] not-italic relative shrink-0 text-[#0a0a0a] text-[12px]">046</p>
      </div>
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[14px]" />
    </div>
  );
}

function Container58() {
  return (
    <div className="h-[21.587px] relative shrink-0 w-[118.7px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] items-center relative size-full">
        <Label10 />
        <Badge22 />
      </div>
    </div>
  );
}

function HelpCircle8() {
  return (
    <div className="h-[16px] overflow-clip relative shrink-0 w-full" data-name="HelpCircle">
      <div className="absolute inset-[8.33%]" data-name="Vector">
        <div className="absolute inset-[-5%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14.6667 14.6667">
            <path d={svgPaths.p3d62dd80} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[29.15%_37.83%_45.83%_37.87%]" data-name="Vector">
        <div className="absolute inset-[-16.65%_-17.15%_-16.66%_-17.16%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5.22018 5.3365">
            <path d={svgPaths.pb91f080} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
      <div className="absolute bottom-[29.17%] left-1/2 right-[49.96%] top-[70.83%]" data-name="Vector">
        <div className="absolute inset-[-0.67px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1.34 1.33333">
            <path d="M0.666667 0.666667H0.673334" id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Button32() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <HelpCircle8 />
      </div>
    </div>
  );
}

function Container57() {
  return (
    <div className="h-[21.587px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between relative size-full">
          <Container58 />
          <Button32 />
        </div>
      </div>
    </div>
  );
}

function Container59() {
  return (
    <div className="h-[18px] overflow-clip relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Consolas:Regular',sans-serif] leading-[18px] left-0 not-italic text-[#6a7282] text-[12px] top-[-0.4px]">bf:originDate</p>
    </div>
  );
}

function Input6() {
  return (
    <div className="bg-[#f3f3f5] h-[36px] relative rounded-[14px] shrink-0 w-full" data-name="Input">
      <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex items-center px-[12px] py-[4px] relative size-full">
          <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#717182] text-[14px]">Enter origin date...</p>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[14px]" />
    </div>
  );
}

function Container56() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] h-[91.588px] items-start relative shrink-0 w-full" data-name="Container">
      <Container57 />
      <Container59 />
      <Input6 />
    </div>
  );
}

function Label11() {
  return (
    <div className="h-[20px] relative shrink-0 w-[76.7px]" data-name="Label">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center relative size-full">
        <p className="font-['Inter:Medium',sans-serif] font-medium leading-[20px] not-italic relative shrink-0 text-[#0a0a0a] text-[14px]">Origin Place</p>
      </div>
    </div>
  );
}

function Badge23() {
  return (
    <div className="h-[21.587px] relative rounded-[14px] shrink-0 w-[37.4px]" data-name="Badge">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center overflow-clip px-[8.8px] py-[2.8px] relative rounded-[inherit] size-full">
        <p className="font-['Consolas:Medium',sans-serif] leading-[16px] not-italic relative shrink-0 text-[#0a0a0a] text-[12px]">370</p>
      </div>
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[14px]" />
    </div>
  );
}

function Badge24() {
  return (
    <div className="bg-[#eceef2] h-[21.587px] relative rounded-[14px] shrink-0 w-[85.738px]" data-name="Badge">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center overflow-clip px-[8.8px] py-[2.8px] relative rounded-[inherit] size-full">
        <p className="font-['Inter:Medium',sans-serif] font-medium leading-[16px] not-italic relative shrink-0 text-[#030213] text-[12px]">LOC-PLACES</p>
      </div>
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[14px]" />
    </div>
  );
}

function Badge25() {
  return (
    <div className="bg-[#155dfc] h-[21.587px] relative rounded-[14px] shrink-0 w-[40.788px]" data-name="Badge">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center overflow-clip px-[8.8px] py-[2.8px] relative rounded-[inherit] size-full">
        <p className="font-['Inter:Medium',sans-serif] font-medium leading-[16px] not-italic relative shrink-0 text-[12px] text-white">LOD</p>
      </div>
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[14px]" />
    </div>
  );
}

function Container62() {
  return (
    <div className="h-[21.587px] relative shrink-0 w-[264.625px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] items-center relative size-full">
        <Label11 />
        <Badge23 />
        <Badge24 />
        <Badge25 />
      </div>
    </div>
  );
}

function HelpCircle9() {
  return (
    <div className="h-[16px] overflow-clip relative shrink-0 w-full" data-name="HelpCircle">
      <div className="absolute inset-[8.33%]" data-name="Vector">
        <div className="absolute inset-[-5%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14.6667 14.6667">
            <path d={svgPaths.p3d62dd80} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[29.15%_37.83%_45.83%_37.87%]" data-name="Vector">
        <div className="absolute inset-[-16.65%_-17.15%_-16.66%_-17.16%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5.22018 5.3365">
            <path d={svgPaths.pb91f080} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
      <div className="absolute bottom-[29.17%] left-1/2 right-[49.96%] top-[70.83%]" data-name="Vector">
        <div className="absolute inset-[-0.67px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1.34 1.33333">
            <path d="M0.666667 0.666667H0.673334" id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Button33() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <HelpCircle9 />
      </div>
    </div>
  );
}

function Container61() {
  return (
    <div className="h-[21.587px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between relative size-full">
          <Container62 />
          <Button33 />
        </div>
      </div>
    </div>
  );
}

function Container63() {
  return (
    <div className="h-[18px] overflow-clip relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Consolas:Regular',sans-serif] leading-[18px] left-0 not-italic text-[#6a7282] text-[12px] top-[-0.4px]">bf:originPlace</p>
    </div>
  );
}

function Search8() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Search">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Search">
          <path d={svgPaths.p107a080} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d="M14 14L11.1333 11.1333" id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Button34() {
  return (
    <div className="absolute bg-[#030213] content-stretch flex h-[32px] items-center justify-center left-[706px] rounded-[14px] top-0 w-[36px]" data-name="Button">
      <Search8 />
    </div>
  );
}

function Input7() {
  return (
    <div className="absolute bg-[#f3f3f5] h-[36px] left-0 rounded-[14px] top-0 w-[698px]" data-name="Input">
      <div className="content-stretch flex items-center overflow-clip px-[12px] py-[4px] relative rounded-[inherit] size-full">
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#717182] text-[14px]">Search geographic names...</p>
      </div>
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[14px]" />
    </div>
  );
}

function Search9() {
  return (
    <div className="absolute left-[12px] size-[16px] top-[10px]" data-name="Search">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Search">
          <path d={svgPaths.p107a080} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d="M14 14L11.1333 11.1333" id="Vector_2" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Container65() {
  return (
    <div className="absolute h-[36px] left-0 top-0 w-[698px]" data-name="Container">
      <Input7 />
      <Search9 />
    </div>
  );
}

function Container64() {
  return (
    <div className="h-[36px] relative shrink-0 w-full" data-name="Container">
      <Button34 />
      <Container65 />
    </div>
  );
}

function Container60() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] h-[91.588px] items-start relative shrink-0 w-full" data-name="Container">
      <Container61 />
      <Container63 />
      <Container64 />
    </div>
  );
}

function Label12() {
  return (
    <div className="h-[20px] relative shrink-0 w-[120.287px]" data-name="Label">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center relative size-full">
        <p className="font-['Inter:Medium',sans-serif] font-medium leading-[20px] not-italic relative shrink-0 text-[#0a0a0a] text-[14px]">Intended Audience</p>
      </div>
    </div>
  );
}

function Badge26() {
  return (
    <div className="h-[21.587px] relative rounded-[14px] shrink-0 w-[37.4px]" data-name="Badge">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center overflow-clip px-[8.8px] py-[2.8px] relative rounded-[inherit] size-full">
        <p className="font-['Consolas:Medium',sans-serif] leading-[16px] not-italic relative shrink-0 text-[#0a0a0a] text-[12px]">521</p>
      </div>
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[14px]" />
    </div>
  );
}

function Container68() {
  return (
    <div className="h-[21.587px] relative shrink-0 w-[165.688px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] items-center relative size-full">
        <Label12 />
        <Badge26 />
      </div>
    </div>
  );
}

function HelpCircle10() {
  return (
    <div className="h-[16px] overflow-clip relative shrink-0 w-full" data-name="HelpCircle">
      <div className="absolute inset-[8.33%]" data-name="Vector">
        <div className="absolute inset-[-5%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14.6667 14.6667">
            <path d={svgPaths.p3d62dd80} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[29.15%_37.83%_45.83%_37.87%]" data-name="Vector">
        <div className="absolute inset-[-16.65%_-17.15%_-16.66%_-17.16%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5.22018 5.3365">
            <path d={svgPaths.pb91f080} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
      <div className="absolute bottom-[29.17%] left-1/2 right-[49.96%] top-[70.83%]" data-name="Vector">
        <div className="absolute inset-[-0.67px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1.34 1.33333">
            <path d="M0.666667 0.666667H0.673334" id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Button35() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <HelpCircle10 />
      </div>
    </div>
  );
}

function Container67() {
  return (
    <div className="h-[21.587px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between relative size-full">
          <Container68 />
          <Button35 />
        </div>
      </div>
    </div>
  );
}

function Container69() {
  return (
    <div className="h-[18px] overflow-clip relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Consolas:Regular',sans-serif] leading-[18px] left-0 not-italic text-[#6a7282] text-[12px] top-[-0.4px]">bf:intendedAudience</p>
    </div>
  );
}

function Input8() {
  return (
    <div className="bg-[#f3f3f5] h-[36px] relative rounded-[14px] shrink-0 w-full" data-name="Input">
      <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex items-center px-[12px] py-[4px] relative size-full">
          <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#717182] text-[14px]">Enter intended audience...</p>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[14px]" />
    </div>
  );
}

function Container66() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] h-[91.588px] items-start relative shrink-0 w-full" data-name="Container">
      <Container67 />
      <Container69 />
      <Input8 />
    </div>
  );
}

function Label13() {
  return (
    <div className="h-[20px] relative shrink-0 w-[60.763px]" data-name="Label">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center relative size-full">
        <p className="font-['Inter:Medium',sans-serif] font-medium leading-[20px] not-italic relative shrink-0 text-[#0a0a0a] text-[14px]">Summary</p>
      </div>
    </div>
  );
}

function Badge27() {
  return (
    <div className="h-[21.587px] relative rounded-[14px] shrink-0 w-[37.4px]" data-name="Badge">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center overflow-clip px-[8.8px] py-[2.8px] relative rounded-[inherit] size-full">
        <p className="font-['Consolas:Medium',sans-serif] leading-[16px] not-italic relative shrink-0 text-[#0a0a0a] text-[12px]">520</p>
      </div>
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[14px]" />
    </div>
  );
}

function Container72() {
  return (
    <div className="h-[21.587px] relative shrink-0 w-[106.162px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] items-center relative size-full">
        <Label13 />
        <Badge27 />
      </div>
    </div>
  );
}

function HelpCircle11() {
  return (
    <div className="h-[16px] overflow-clip relative shrink-0 w-full" data-name="HelpCircle">
      <div className="absolute inset-[8.33%]" data-name="Vector">
        <div className="absolute inset-[-5%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14.6667 14.6667">
            <path d={svgPaths.p3d62dd80} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[29.15%_37.83%_45.83%_37.87%]" data-name="Vector">
        <div className="absolute inset-[-16.65%_-17.15%_-16.66%_-17.16%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5.22018 5.3365">
            <path d={svgPaths.pb91f080} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
      <div className="absolute bottom-[29.17%] left-1/2 right-[49.96%] top-[70.83%]" data-name="Vector">
        <div className="absolute inset-[-0.67px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1.34 1.33333">
            <path d="M0.666667 0.666667H0.673334" id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Button36() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <HelpCircle11 />
      </div>
    </div>
  );
}

function Container71() {
  return (
    <div className="h-[21.587px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between relative size-full">
          <Container72 />
          <Button36 />
        </div>
      </div>
    </div>
  );
}

function Container73() {
  return (
    <div className="h-[18px] overflow-clip relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Consolas:Regular',sans-serif] leading-[18px] left-0 not-italic text-[#6a7282] text-[12px] top-[-0.4px]">bf:summary</p>
    </div>
  );
}

function Textarea() {
  return (
    <div className="h-[100px] relative rounded-[14px] shrink-0 w-full" data-name="textarea">
      <div className="overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex items-start p-[8px] relative size-full">
          <p className="font-['Inter:Regular',sans-serif] font-normal leading-[24px] not-italic relative shrink-0 text-[16px] text-[rgba(10,10,10,0.5)]">Summary of the work</p>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[14px]" />
    </div>
  );
}

function Container70() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] h-[161.188px] items-start relative shrink-0 w-full" data-name="Container">
      <Container71 />
      <Container73 />
      <Textarea />
    </div>
  );
}

function Label14() {
  return (
    <div className="h-[20px] relative shrink-0 w-[110.775px]" data-name="Label">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center relative size-full">
        <p className="font-['Inter:Medium',sans-serif] font-medium leading-[20px] not-italic relative shrink-0 text-[#0a0a0a] text-[14px]">Table of Contents</p>
      </div>
    </div>
  );
}

function Badge28() {
  return (
    <div className="h-[21.587px] relative rounded-[14px] shrink-0 w-[37.4px]" data-name="Badge">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center overflow-clip px-[8.8px] py-[2.8px] relative rounded-[inherit] size-full">
        <p className="font-['Consolas:Medium',sans-serif] leading-[16px] not-italic relative shrink-0 text-[#0a0a0a] text-[12px]">505</p>
      </div>
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[14px]" />
    </div>
  );
}

function Container76() {
  return (
    <div className="h-[21.587px] relative shrink-0 w-[156.175px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] items-center relative size-full">
        <Label14 />
        <Badge28 />
      </div>
    </div>
  );
}

function HelpCircle12() {
  return (
    <div className="h-[16px] overflow-clip relative shrink-0 w-full" data-name="HelpCircle">
      <div className="absolute inset-[8.33%]" data-name="Vector">
        <div className="absolute inset-[-5%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14.6667 14.6667">
            <path d={svgPaths.p3d62dd80} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[29.15%_37.83%_45.83%_37.87%]" data-name="Vector">
        <div className="absolute inset-[-16.65%_-17.15%_-16.66%_-17.16%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5.22018 5.3365">
            <path d={svgPaths.pb91f080} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
      <div className="absolute bottom-[29.17%] left-1/2 right-[49.96%] top-[70.83%]" data-name="Vector">
        <div className="absolute inset-[-0.67px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1.34 1.33333">
            <path d="M0.666667 0.666667H0.673334" id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Button37() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <HelpCircle12 />
      </div>
    </div>
  );
}

function Container75() {
  return (
    <div className="h-[21.587px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between relative size-full">
          <Container76 />
          <Button37 />
        </div>
      </div>
    </div>
  );
}

function Container77() {
  return (
    <div className="h-[18px] overflow-clip relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Consolas:Regular',sans-serif] leading-[18px] left-0 not-italic text-[#6a7282] text-[12px] top-[-0.4px]">bf:tableOfContents</p>
    </div>
  );
}

function Input9() {
  return (
    <div className="bg-[#f3f3f5] h-[36px] relative rounded-[14px] shrink-0 w-full" data-name="Input">
      <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex items-center px-[12px] py-[4px] relative size-full">
          <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#717182] text-[14px]">Enter table of contents...</p>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[14px]" />
    </div>
  );
}

function Container74() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] h-[91.588px] items-start relative shrink-0 w-full" data-name="Container">
      <Container75 />
      <Container77 />
      <Input9 />
    </div>
  );
}

function Label15() {
  return (
    <div className="h-[20px] relative shrink-0 w-[31.525px]" data-name="Label">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center relative size-full">
        <p className="font-['Inter:Medium',sans-serif] font-medium leading-[20px] not-italic relative shrink-0 text-[#0a0a0a] text-[14px]">Note</p>
      </div>
    </div>
  );
}

function Badge29() {
  return (
    <div className="h-[21.587px] relative rounded-[14px] shrink-0 w-[37.4px]" data-name="Badge">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center overflow-clip px-[8.8px] py-[2.8px] relative rounded-[inherit] size-full">
        <p className="font-['Consolas:Medium',sans-serif] leading-[16px] not-italic relative shrink-0 text-[#0a0a0a] text-[12px]">500</p>
      </div>
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[14px]" />
    </div>
  );
}

function Container80() {
  return (
    <div className="h-[21.587px] relative shrink-0 w-[76.925px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] items-center relative size-full">
        <Label15 />
        <Badge29 />
      </div>
    </div>
  );
}

function HelpCircle13() {
  return (
    <div className="h-[16px] overflow-clip relative shrink-0 w-full" data-name="HelpCircle">
      <div className="absolute inset-[8.33%]" data-name="Vector">
        <div className="absolute inset-[-5%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14.6667 14.6667">
            <path d={svgPaths.p3d62dd80} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[29.15%_37.83%_45.83%_37.87%]" data-name="Vector">
        <div className="absolute inset-[-16.65%_-17.15%_-16.66%_-17.16%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5.22018 5.3365">
            <path d={svgPaths.pb91f080} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
      <div className="absolute bottom-[29.17%] left-1/2 right-[49.96%] top-[70.83%]" data-name="Vector">
        <div className="absolute inset-[-0.67px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1.34 1.33333">
            <path d="M0.666667 0.666667H0.673334" id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Button38() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <HelpCircle13 />
      </div>
    </div>
  );
}

function Container79() {
  return (
    <div className="h-[21.587px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between relative size-full">
          <Container80 />
          <Button38 />
        </div>
      </div>
    </div>
  );
}

function Container81() {
  return (
    <div className="h-[18px] overflow-clip relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Consolas:Regular',sans-serif] leading-[18px] left-0 not-italic text-[#6a7282] text-[12px] top-[-0.4px]">bf:note</p>
    </div>
  );
}

function Textarea1() {
  return (
    <div className="h-[80px] relative rounded-[14px] shrink-0 w-full" data-name="textarea">
      <div className="overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex items-start p-[8px] relative size-full">
          <p className="font-['Inter:Regular',sans-serif] font-normal leading-[24px] not-italic relative shrink-0 text-[16px] text-[rgba(10,10,10,0.5)]">General note</p>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[14px]" />
    </div>
  );
}

function Container78() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] h-[141.188px] items-start relative shrink-0 w-full" data-name="Container">
      <Container79 />
      <Container81 />
      <Textarea1 />
    </div>
  );
}

function Label16() {
  return (
    <div className="h-[20px] relative shrink-0 w-[210.025px]" data-name="Label">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center relative size-full">
        <p className="font-['Inter:Medium',sans-serif] font-medium leading-[20px] not-italic relative shrink-0 text-[#0a0a0a] text-[14px]">Library of Congress Classification</p>
      </div>
    </div>
  );
}

function Badge30() {
  return (
    <div className="h-[21.587px] relative rounded-[14px] shrink-0 w-[37.4px]" data-name="Badge">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center overflow-clip px-[8.8px] py-[2.8px] relative rounded-[inherit] size-full">
        <p className="font-['Consolas:Medium',sans-serif] leading-[16px] not-italic relative shrink-0 text-[#0a0a0a] text-[12px]">050</p>
      </div>
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[14px]" />
    </div>
  );
}

function Container84() {
  return (
    <div className="h-[21.587px] relative shrink-0 w-[255.425px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] items-center relative size-full">
        <Label16 />
        <Badge30 />
      </div>
    </div>
  );
}

function HelpCircle14() {
  return (
    <div className="h-[16px] overflow-clip relative shrink-0 w-full" data-name="HelpCircle">
      <div className="absolute inset-[8.33%]" data-name="Vector">
        <div className="absolute inset-[-5%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14.6667 14.6667">
            <path d={svgPaths.p3d62dd80} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[29.15%_37.83%_45.83%_37.87%]" data-name="Vector">
        <div className="absolute inset-[-16.65%_-17.15%_-16.66%_-17.16%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5.22018 5.3365">
            <path d={svgPaths.pb91f080} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
      <div className="absolute bottom-[29.17%] left-1/2 right-[49.96%] top-[70.83%]" data-name="Vector">
        <div className="absolute inset-[-0.67px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1.34 1.33333">
            <path d="M0.666667 0.666667H0.673334" id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Button39() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <HelpCircle14 />
      </div>
    </div>
  );
}

function Container83() {
  return (
    <div className="h-[21.587px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between relative size-full">
          <Container84 />
          <Button39 />
        </div>
      </div>
    </div>
  );
}

function Container85() {
  return (
    <div className="h-[18px] overflow-clip relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Consolas:Regular',sans-serif] leading-[18px] left-0 not-italic text-[#6a7282] text-[12px] top-[-0.4px]">bf:classificationLcc</p>
    </div>
  );
}

function Plus1() {
  return (
    <div className="absolute left-[287.33px] size-[16px] top-[8px]" data-name="Plus">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Plus">
          <path d="M3.33333 8H12.6667" id="Vector" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d="M8 3.33333V12.6667" id="Vector_2" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Button40() {
  return (
    <div className="bg-white h-[32px] relative rounded-[14px] shrink-0 w-full" data-name="Button">
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[14px]" />
      <Plus1 />
      <p className="-translate-x-1/2 absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[20px] left-[386.83px] not-italic text-[#0a0a0a] text-[14px] text-center top-[5.8px] tracking-[-0.14px]">Add LCC Classification</p>
    </div>
  );
}

function Container82() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] h-[87.588px] items-start relative shrink-0 w-full" data-name="Container">
      <Container83 />
      <Container85 />
      <Button40 />
    </div>
  );
}

function Label17() {
  return (
    <div className="h-[20px] relative shrink-0 w-[184.35px]" data-name="Label">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center relative size-full">
        <p className="font-['Inter:Medium',sans-serif] font-medium leading-[20px] not-italic relative shrink-0 text-[#0a0a0a] text-[14px]">Dewey Decimal Classification</p>
      </div>
    </div>
  );
}

function Badge31() {
  return (
    <div className="h-[21.587px] relative rounded-[14px] shrink-0 w-[37.4px]" data-name="Badge">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center overflow-clip px-[8.8px] py-[2.8px] relative rounded-[inherit] size-full">
        <p className="font-['Consolas:Medium',sans-serif] leading-[16px] not-italic relative shrink-0 text-[#0a0a0a] text-[12px]">082</p>
      </div>
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[14px]" />
    </div>
  );
}

function Container88() {
  return (
    <div className="h-[21.587px] relative shrink-0 w-[229.75px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] items-center relative size-full">
        <Label17 />
        <Badge31 />
      </div>
    </div>
  );
}

function HelpCircle15() {
  return (
    <div className="h-[16px] overflow-clip relative shrink-0 w-full" data-name="HelpCircle">
      <div className="absolute inset-[8.33%]" data-name="Vector">
        <div className="absolute inset-[-5%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14.6667 14.6667">
            <path d={svgPaths.p3d62dd80} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[29.15%_37.83%_45.83%_37.87%]" data-name="Vector">
        <div className="absolute inset-[-16.65%_-17.15%_-16.66%_-17.16%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5.22018 5.3365">
            <path d={svgPaths.pb91f080} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
      <div className="absolute bottom-[29.17%] left-1/2 right-[49.96%] top-[70.83%]" data-name="Vector">
        <div className="absolute inset-[-0.67px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1.34 1.33333">
            <path d="M0.666667 0.666667H0.673334" id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Button41() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <HelpCircle15 />
      </div>
    </div>
  );
}

function Container87() {
  return (
    <div className="h-[21.587px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between relative size-full">
          <Container88 />
          <Button41 />
        </div>
      </div>
    </div>
  );
}

function Container89() {
  return (
    <div className="h-[18px] overflow-clip relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Consolas:Regular',sans-serif] leading-[18px] left-0 not-italic text-[#6a7282] text-[12px] top-[-0.4px]">bf:classificationDdc</p>
    </div>
  );
}

function Plus2() {
  return (
    <div className="absolute left-[284.65px] size-[16px] top-[8px]" data-name="Plus">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Plus">
          <path d="M3.33333 8H12.6667" id="Vector" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d="M8 3.33333V12.6667" id="Vector_2" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Button42() {
  return (
    <div className="bg-white h-[32px] relative rounded-[14px] shrink-0 w-full" data-name="Button">
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[14px]" />
      <Plus2 />
      <p className="-translate-x-1/2 absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[20px] left-[386.15px] not-italic text-[#0a0a0a] text-[14px] text-center top-[5.8px] tracking-[-0.14px]">Add DDC Classification</p>
    </div>
  );
}

function Container86() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] h-[87.588px] items-start relative shrink-0 w-full" data-name="Container">
      <Container87 />
      <Container89 />
      <Button42 />
    </div>
  );
}

function Label18() {
  return (
    <div className="h-[20px] relative shrink-0 w-[141.375px]" data-name="Label">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center relative size-full">
        <p className="font-['Inter:Medium',sans-serif] font-medium leading-[20px] not-italic relative shrink-0 text-[#0a0a0a] text-[14px]">Topical Subject (LCSH)</p>
      </div>
    </div>
  );
}

function Badge32() {
  return (
    <div className="h-[21.587px] relative rounded-[14px] shrink-0 w-[37.4px]" data-name="Badge">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center overflow-clip px-[8.8px] py-[2.8px] relative rounded-[inherit] size-full">
        <p className="font-['Consolas:Medium',sans-serif] leading-[16px] not-italic relative shrink-0 text-[#0a0a0a] text-[12px]">650</p>
      </div>
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[14px]" />
    </div>
  );
}

function Badge33() {
  return (
    <div className="bg-[#eceef2] h-[21.587px] relative rounded-[14px] shrink-0 w-[98.25px]" data-name="Badge">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center overflow-clip px-[8.8px] py-[2.8px] relative rounded-[inherit] size-full">
        <p className="font-['Inter:Medium',sans-serif] font-medium leading-[16px] not-italic relative shrink-0 text-[#030213] text-[12px]">LOC-SUBJECTS</p>
      </div>
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[14px]" />
    </div>
  );
}

function Badge34() {
  return (
    <div className="bg-[#155dfc] h-[21.587px] relative rounded-[14px] shrink-0 w-[40.788px]" data-name="Badge">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center overflow-clip px-[8.8px] py-[2.8px] relative rounded-[inherit] size-full">
        <p className="font-['Inter:Medium',sans-serif] font-medium leading-[16px] not-italic relative shrink-0 text-[12px] text-white">LOD</p>
      </div>
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[14px]" />
    </div>
  );
}

function Container92() {
  return (
    <div className="h-[21.587px] relative shrink-0 w-[341.813px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] items-center relative size-full">
        <Label18 />
        <Badge32 />
        <Badge33 />
        <Badge34 />
      </div>
    </div>
  );
}

function HelpCircle16() {
  return (
    <div className="h-[16px] overflow-clip relative shrink-0 w-full" data-name="HelpCircle">
      <div className="absolute inset-[8.33%]" data-name="Vector">
        <div className="absolute inset-[-5%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14.6667 14.6667">
            <path d={svgPaths.p3d62dd80} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[29.15%_37.83%_45.83%_37.87%]" data-name="Vector">
        <div className="absolute inset-[-16.65%_-17.15%_-16.66%_-17.16%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5.22018 5.3365">
            <path d={svgPaths.pb91f080} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
      <div className="absolute bottom-[29.17%] left-1/2 right-[49.96%] top-[70.83%]" data-name="Vector">
        <div className="absolute inset-[-0.67px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1.34 1.33333">
            <path d="M0.666667 0.666667H0.673334" id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Button43() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <HelpCircle16 />
      </div>
    </div>
  );
}

function Container91() {
  return (
    <div className="h-[21.587px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between relative size-full">
          <Container92 />
          <Button43 />
        </div>
      </div>
    </div>
  );
}

function Container93() {
  return (
    <div className="h-[18px] overflow-clip relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Consolas:Regular',sans-serif] leading-[18px] left-0 not-italic text-[#6a7282] text-[12px] top-[-0.4px]">bf:subject/topical</p>
    </div>
  );
}

function Search10() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Search">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Search">
          <path d={svgPaths.p107a080} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d="M14 14L11.1333 11.1333" id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Button44() {
  return (
    <div className="absolute bg-[#030213] content-stretch flex h-[32px] items-center justify-center left-[706px] rounded-[14px] top-0 w-[36px]" data-name="Button">
      <Search10 />
    </div>
  );
}

function Input10() {
  return (
    <div className="absolute bg-[#f3f3f5] h-[36px] left-0 rounded-[14px] top-0 w-[698px]" data-name="Input">
      <div className="content-stretch flex items-center overflow-clip px-[12px] py-[4px] relative rounded-[inherit] size-full">
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#717182] text-[14px]">Search Library of Congress Subject Headings...</p>
      </div>
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[14px]" />
    </div>
  );
}

function Search11() {
  return (
    <div className="absolute left-[12px] size-[16px] top-[10px]" data-name="Search">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Search">
          <path d={svgPaths.p107a080} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d="M14 14L11.1333 11.1333" id="Vector_2" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Container95() {
  return (
    <div className="absolute h-[36px] left-0 top-0 w-[698px]" data-name="Container">
      <Input10 />
      <Search11 />
    </div>
  );
}

function Container94() {
  return (
    <div className="h-[36px] relative shrink-0 w-full" data-name="Container">
      <Button44 />
      <Container95 />
    </div>
  );
}

function Container90() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] h-[91.588px] items-start relative shrink-0 w-full" data-name="Container">
      <Container91 />
      <Container93 />
      <Container94 />
    </div>
  );
}

function Label19() {
  return (
    <div className="h-[20px] relative shrink-0 w-[124.125px]" data-name="Label">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center relative size-full">
        <p className="font-['Inter:Medium',sans-serif] font-medium leading-[20px] not-italic relative shrink-0 text-[#0a0a0a] text-[14px]">Geographic Subject</p>
      </div>
    </div>
  );
}

function Badge35() {
  return (
    <div className="h-[21.587px] relative rounded-[14px] shrink-0 w-[37.4px]" data-name="Badge">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center overflow-clip px-[8.8px] py-[2.8px] relative rounded-[inherit] size-full">
        <p className="font-['Consolas:Medium',sans-serif] leading-[16px] not-italic relative shrink-0 text-[#0a0a0a] text-[12px]">651</p>
      </div>
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[14px]" />
    </div>
  );
}

function Badge36() {
  return (
    <div className="bg-[#eceef2] h-[21.587px] relative rounded-[14px] shrink-0 w-[85.738px]" data-name="Badge">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center overflow-clip px-[8.8px] py-[2.8px] relative rounded-[inherit] size-full">
        <p className="font-['Inter:Medium',sans-serif] font-medium leading-[16px] not-italic relative shrink-0 text-[#030213] text-[12px]">LOC-PLACES</p>
      </div>
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[14px]" />
    </div>
  );
}

function Badge37() {
  return (
    <div className="bg-[#155dfc] h-[21.587px] relative rounded-[14px] shrink-0 w-[40.788px]" data-name="Badge">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center overflow-clip px-[8.8px] py-[2.8px] relative rounded-[inherit] size-full">
        <p className="font-['Inter:Medium',sans-serif] font-medium leading-[16px] not-italic relative shrink-0 text-[12px] text-white">LOD</p>
      </div>
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[14px]" />
    </div>
  );
}

function Container98() {
  return (
    <div className="h-[21.587px] relative shrink-0 w-[312.05px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] items-center relative size-full">
        <Label19 />
        <Badge35 />
        <Badge36 />
        <Badge37 />
      </div>
    </div>
  );
}

function HelpCircle17() {
  return (
    <div className="h-[16px] overflow-clip relative shrink-0 w-full" data-name="HelpCircle">
      <div className="absolute inset-[8.33%]" data-name="Vector">
        <div className="absolute inset-[-5%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14.6667 14.6667">
            <path d={svgPaths.p3d62dd80} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[29.15%_37.83%_45.83%_37.87%]" data-name="Vector">
        <div className="absolute inset-[-16.65%_-17.15%_-16.66%_-17.16%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5.22018 5.3365">
            <path d={svgPaths.pb91f080} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
      <div className="absolute bottom-[29.17%] left-1/2 right-[49.96%] top-[70.83%]" data-name="Vector">
        <div className="absolute inset-[-0.67px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1.34 1.33333">
            <path d="M0.666667 0.666667H0.673334" id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Button45() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <HelpCircle17 />
      </div>
    </div>
  );
}

function Container97() {
  return (
    <div className="h-[21.587px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between relative size-full">
          <Container98 />
          <Button45 />
        </div>
      </div>
    </div>
  );
}

function Container99() {
  return (
    <div className="h-[18px] overflow-clip relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Consolas:Regular',sans-serif] leading-[18px] left-0 not-italic text-[#6a7282] text-[12px] top-[-0.4px]">bf:subject/geographic</p>
    </div>
  );
}

function Search12() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Search">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Search">
          <path d={svgPaths.p107a080} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d="M14 14L11.1333 11.1333" id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Button46() {
  return (
    <div className="absolute bg-[#030213] content-stretch flex h-[32px] items-center justify-center left-[706px] rounded-[14px] top-0 w-[36px]" data-name="Button">
      <Search12 />
    </div>
  );
}

function Input11() {
  return (
    <div className="absolute bg-[#f3f3f5] h-[36px] left-0 rounded-[14px] top-0 w-[698px]" data-name="Input">
      <div className="content-stretch flex items-center overflow-clip px-[12px] py-[4px] relative rounded-[inherit] size-full">
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#717182] text-[14px]">Search geographic names...</p>
      </div>
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[14px]" />
    </div>
  );
}

function Search13() {
  return (
    <div className="absolute left-[12px] size-[16px] top-[10px]" data-name="Search">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Search">
          <path d={svgPaths.p107a080} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d="M14 14L11.1333 11.1333" id="Vector_2" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Container101() {
  return (
    <div className="absolute h-[36px] left-0 top-0 w-[698px]" data-name="Container">
      <Input11 />
      <Search13 />
    </div>
  );
}

function Container100() {
  return (
    <div className="h-[36px] relative shrink-0 w-full" data-name="Container">
      <Button46 />
      <Container101 />
    </div>
  );
}

function Container96() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] h-[91.588px] items-start relative shrink-0 w-full" data-name="Container">
      <Container97 />
      <Container99 />
      <Container100 />
    </div>
  );
}

function Label20() {
  return (
    <div className="h-[20px] relative shrink-0 w-[88.7px]" data-name="Label">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center relative size-full">
        <p className="font-['Inter:Medium',sans-serif] font-medium leading-[20px] not-italic relative shrink-0 text-[#0a0a0a] text-[14px]">Name Subject</p>
      </div>
    </div>
  );
}

function Badge38() {
  return (
    <div className="h-[21.587px] relative rounded-[14px] shrink-0 w-[37.4px]" data-name="Badge">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center overflow-clip px-[8.8px] py-[2.8px] relative rounded-[inherit] size-full">
        <p className="font-['Consolas:Medium',sans-serif] leading-[16px] not-italic relative shrink-0 text-[#0a0a0a] text-[12px]">600</p>
      </div>
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[14px]" />
    </div>
  );
}

function Badge39() {
  return (
    <div className="bg-[#eceef2] h-[21.587px] relative rounded-[14px] shrink-0 w-[85.563px]" data-name="Badge">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center overflow-clip px-[8.8px] py-[2.8px] relative rounded-[inherit] size-full">
        <p className="font-['Inter:Medium',sans-serif] font-medium leading-[16px] not-italic relative shrink-0 text-[#030213] text-[12px]">LOC-NAMES</p>
      </div>
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[14px]" />
    </div>
  );
}

function Badge40() {
  return (
    <div className="bg-[#155dfc] h-[21.587px] relative rounded-[14px] shrink-0 w-[40.788px]" data-name="Badge">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center overflow-clip px-[8.8px] py-[2.8px] relative rounded-[inherit] size-full">
        <p className="font-['Inter:Medium',sans-serif] font-medium leading-[16px] not-italic relative shrink-0 text-[12px] text-white">LOD</p>
      </div>
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[14px]" />
    </div>
  );
}

function Container104() {
  return (
    <div className="h-[21.587px] relative shrink-0 w-[276.45px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] items-center relative size-full">
        <Label20 />
        <Badge38 />
        <Badge39 />
        <Badge40 />
      </div>
    </div>
  );
}

function HelpCircle18() {
  return (
    <div className="h-[16px] overflow-clip relative shrink-0 w-full" data-name="HelpCircle">
      <div className="absolute inset-[8.33%]" data-name="Vector">
        <div className="absolute inset-[-5%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14.6667 14.6667">
            <path d={svgPaths.p3d62dd80} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[29.15%_37.83%_45.83%_37.87%]" data-name="Vector">
        <div className="absolute inset-[-16.65%_-17.15%_-16.66%_-17.16%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5.22018 5.3365">
            <path d={svgPaths.pb91f080} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
      <div className="absolute bottom-[29.17%] left-1/2 right-[49.96%] top-[70.83%]" data-name="Vector">
        <div className="absolute inset-[-0.67px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1.34 1.33333">
            <path d="M0.666667 0.666667H0.673334" id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Button47() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <HelpCircle18 />
      </div>
    </div>
  );
}

function Container103() {
  return (
    <div className="h-[21.587px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between relative size-full">
          <Container104 />
          <Button47 />
        </div>
      </div>
    </div>
  );
}

function Container105() {
  return (
    <div className="h-[18px] overflow-clip relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Consolas:Regular',sans-serif] leading-[18px] left-0 not-italic text-[#6a7282] text-[12px] top-[-0.4px]">bf:subject/name</p>
    </div>
  );
}

function Option37() {
  return <div className="h-0 shrink-0 w-full" data-name="option" />;
}

function Option38() {
  return <div className="h-0 shrink-0 w-full" data-name="option" />;
}

function Option39() {
  return <div className="h-0 shrink-0 w-full" data-name="option" />;
}

function Option40() {
  return <div className="h-0 shrink-0 w-full" data-name="option" />;
}

function Option41() {
  return <div className="h-0 shrink-0 w-full" data-name="option" />;
}

function Option42() {
  return <div className="h-0 shrink-0 w-full" data-name="option" />;
}

function Option43() {
  return <div className="h-0 shrink-0 w-full" data-name="option" />;
}

function Option44() {
  return <div className="h-0 shrink-0 w-full" data-name="option" />;
}

function Option45() {
  return <div className="h-0 shrink-0 w-full" data-name="option" />;
}

function Option46() {
  return <div className="h-0 shrink-0 w-full" data-name="option" />;
}

function Option47() {
  return <div className="h-0 shrink-0 w-full" data-name="option" />;
}

function Option48() {
  return <div className="h-0 shrink-0 w-full" data-name="option" />;
}

function Select3() {
  return (
    <div className="absolute content-stretch flex flex-col h-[36px] items-start left-[466px] pb-[0.8px] pl-[-514.8px] pr-[746.8px] pt-[-2569.762px] rounded-[14px] top-0 w-[232px]" data-name="select">
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[14px]" />
      <Option37 />
      <Option38 />
      <Option39 />
      <Option40 />
      <Option41 />
      <Option42 />
      <Option43 />
      <Option44 />
      <Option45 />
      <Option46 />
      <Option47 />
      <Option48 />
    </div>
  );
}

function Search14() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Search">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Search">
          <path d={svgPaths.p107a080} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d="M14 14L11.1333 11.1333" id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Button48() {
  return (
    <div className="absolute bg-[#030213] content-stretch flex h-[32px] items-center justify-center left-[706px] rounded-[14px] top-0 w-[36px]" data-name="Button">
      <Search14 />
    </div>
  );
}

function Input12() {
  return (
    <div className="absolute bg-[#f3f3f5] h-[36px] left-0 rounded-[14px] top-0 w-[458px]" data-name="Input">
      <div className="content-stretch flex items-center overflow-clip px-[12px] py-[4px] relative rounded-[inherit] size-full">
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#717182] text-[14px]">Search LOC Name Authority File...</p>
      </div>
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[14px]" />
    </div>
  );
}

function Search15() {
  return (
    <div className="absolute left-[12px] size-[16px] top-[10px]" data-name="Search">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Search">
          <path d={svgPaths.p107a080} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d="M14 14L11.1333 11.1333" id="Vector_2" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Container107() {
  return (
    <div className="absolute h-[36px] left-0 top-0 w-[458px]" data-name="Container">
      <Input12 />
      <Search15 />
    </div>
  );
}

function Container106() {
  return (
    <div className="h-[36px] relative shrink-0 w-full" data-name="Container">
      <Select3 />
      <Button48 />
      <Container107 />
    </div>
  );
}

function Container102() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] h-[91.588px] items-start relative shrink-0 w-full" data-name="Container">
      <Container103 />
      <Container105 />
      <Container106 />
    </div>
  );
}

function Label21() {
  return (
    <div className="h-[20px] relative shrink-0 w-[143.15px]" data-name="Label">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center relative size-full">
        <p className="font-['Inter:Medium',sans-serif] font-medium leading-[20px] not-italic relative shrink-0 text-[#0a0a0a] text-[14px]">Geographic Area Code</p>
      </div>
    </div>
  );
}

function Badge41() {
  return (
    <div className="h-[21.587px] relative rounded-[14px] shrink-0 w-[37.4px]" data-name="Badge">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center overflow-clip px-[8.8px] py-[2.8px] relative rounded-[inherit] size-full">
        <p className="font-['Consolas:Medium',sans-serif] leading-[16px] not-italic relative shrink-0 text-[#0a0a0a] text-[12px]">043</p>
      </div>
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[14px]" />
    </div>
  );
}

function Badge42() {
  return (
    <div className="bg-[#eceef2] h-[21.587px] relative rounded-[14px] shrink-0 w-[155.225px]" data-name="Badge">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center overflow-clip px-[8.8px] py-[2.8px] relative rounded-[inherit] size-full">
        <p className="font-['Inter:Medium',sans-serif] font-medium leading-[16px] not-italic relative shrink-0 text-[#030213] text-[12px]">LOC-GEOGRAPHICAREAS</p>
      </div>
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[14px]" />
    </div>
  );
}

function Badge43() {
  return (
    <div className="bg-[#155dfc] h-[21.587px] relative rounded-[14px] shrink-0 w-[40.788px]" data-name="Badge">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center overflow-clip px-[8.8px] py-[2.8px] relative rounded-[inherit] size-full">
        <p className="font-['Inter:Medium',sans-serif] font-medium leading-[16px] not-italic relative shrink-0 text-[12px] text-white">LOD</p>
      </div>
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[14px]" />
    </div>
  );
}

function Container110() {
  return (
    <div className="h-[21.587px] relative shrink-0 w-[400.563px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] items-center relative size-full">
        <Label21 />
        <Badge41 />
        <Badge42 />
        <Badge43 />
      </div>
    </div>
  );
}

function HelpCircle19() {
  return (
    <div className="h-[16px] overflow-clip relative shrink-0 w-full" data-name="HelpCircle">
      <div className="absolute inset-[8.33%]" data-name="Vector">
        <div className="absolute inset-[-5%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14.6667 14.6667">
            <path d={svgPaths.p3d62dd80} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[29.15%_37.83%_45.83%_37.87%]" data-name="Vector">
        <div className="absolute inset-[-16.65%_-17.15%_-16.66%_-17.16%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5.22018 5.3365">
            <path d={svgPaths.pb91f080} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
      <div className="absolute bottom-[29.17%] left-1/2 right-[49.96%] top-[70.83%]" data-name="Vector">
        <div className="absolute inset-[-0.67px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1.34 1.33333">
            <path d="M0.666667 0.666667H0.673334" id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Button49() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <HelpCircle19 />
      </div>
    </div>
  );
}

function Container109() {
  return (
    <div className="h-[21.587px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between relative size-full">
          <Container110 />
          <Button49 />
        </div>
      </div>
    </div>
  );
}

function Container111() {
  return (
    <div className="h-[18px] overflow-clip relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Consolas:Regular',sans-serif] leading-[18px] left-0 not-italic text-[#6a7282] text-[12px] top-[-0.4px]">bf:geographicAreaCode</p>
    </div>
  );
}

function Search16() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Search">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Search">
          <path d={svgPaths.p107a080} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d="M14 14L11.1333 11.1333" id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Button50() {
  return (
    <div className="absolute bg-[#030213] content-stretch flex h-[32px] items-center justify-center left-[706px] rounded-[14px] top-0 w-[36px]" data-name="Button">
      <Search16 />
    </div>
  );
}

function Input13() {
  return (
    <div className="absolute bg-[#f3f3f5] h-[36px] left-0 rounded-[14px] top-0 w-[698px]" data-name="Input">
      <div className="content-stretch flex items-center overflow-clip px-[12px] py-[4px] relative rounded-[inherit] size-full">
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#717182] text-[14px]">Search geographic names...</p>
      </div>
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[14px]" />
    </div>
  );
}

function Search17() {
  return (
    <div className="absolute left-[12px] size-[16px] top-[10px]" data-name="Search">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Search">
          <path d={svgPaths.p107a080} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d="M14 14L11.1333 11.1333" id="Vector_2" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Container113() {
  return (
    <div className="absolute h-[36px] left-0 top-0 w-[698px]" data-name="Container">
      <Input13 />
      <Search17 />
    </div>
  );
}

function Container112() {
  return (
    <div className="h-[36px] relative shrink-0 w-full" data-name="Container">
      <Button50 />
      <Container113 />
    </div>
  );
}

function Container108() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] h-[91.588px] items-start relative shrink-0 w-full" data-name="Container">
      <Container109 />
      <Container111 />
      <Container112 />
    </div>
  );
}

function Label22() {
  return (
    <div className="h-[20px] relative shrink-0 w-[100.463px]" data-name="Label">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center relative size-full">
        <p className="font-['Inter:Medium',sans-serif] font-medium leading-[20px] not-italic relative shrink-0 text-[#0a0a0a] text-[14px]">Primary Creator</p>
      </div>
    </div>
  );
}

function Badge44() {
  return (
    <div className="h-[21.587px] relative rounded-[14px] shrink-0 w-[37.4px]" data-name="Badge">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center overflow-clip px-[8.8px] py-[2.8px] relative rounded-[inherit] size-full">
        <p className="font-['Consolas:Medium',sans-serif] leading-[16px] not-italic relative shrink-0 text-[#0a0a0a] text-[12px]">100</p>
      </div>
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[14px]" />
    </div>
  );
}

function Badge45() {
  return (
    <div className="bg-[#eceef2] h-[21.587px] relative rounded-[14px] shrink-0 w-[85.563px]" data-name="Badge">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center overflow-clip px-[8.8px] py-[2.8px] relative rounded-[inherit] size-full">
        <p className="font-['Inter:Medium',sans-serif] font-medium leading-[16px] not-italic relative shrink-0 text-[#030213] text-[12px]">LOC-NAMES</p>
      </div>
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[14px]" />
    </div>
  );
}

function Badge46() {
  return (
    <div className="bg-[#155dfc] h-[21.587px] relative rounded-[14px] shrink-0 w-[40.788px]" data-name="Badge">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center overflow-clip px-[8.8px] py-[2.8px] relative rounded-[inherit] size-full">
        <p className="font-['Inter:Medium',sans-serif] font-medium leading-[16px] not-italic relative shrink-0 text-[12px] text-white">LOD</p>
      </div>
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[14px]" />
    </div>
  );
}

function Container116() {
  return (
    <div className="h-[21.587px] relative shrink-0 w-[288.212px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] items-center relative size-full">
        <Label22 />
        <Badge44 />
        <Badge45 />
        <Badge46 />
      </div>
    </div>
  );
}

function HelpCircle20() {
  return (
    <div className="h-[16px] overflow-clip relative shrink-0 w-full" data-name="HelpCircle">
      <div className="absolute inset-[8.33%]" data-name="Vector">
        <div className="absolute inset-[-5%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14.6667 14.6667">
            <path d={svgPaths.p3d62dd80} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[29.15%_37.83%_45.83%_37.87%]" data-name="Vector">
        <div className="absolute inset-[-16.65%_-17.15%_-16.66%_-17.16%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5.22018 5.3365">
            <path d={svgPaths.pb91f080} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
      <div className="absolute bottom-[29.17%] left-1/2 right-[49.96%] top-[70.83%]" data-name="Vector">
        <div className="absolute inset-[-0.67px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1.34 1.33333">
            <path d="M0.666667 0.666667H0.673334" id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Button51() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <HelpCircle20 />
      </div>
    </div>
  );
}

function Container115() {
  return (
    <div className="h-[21.587px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between relative size-full">
          <Container116 />
          <Button51 />
        </div>
      </div>
    </div>
  );
}

function Container117() {
  return (
    <div className="h-[18px] overflow-clip relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Consolas:Regular',sans-serif] leading-[18px] left-0 not-italic text-[#6a7282] text-[12px] top-[-0.4px]">bf:contribution/primary</p>
    </div>
  );
}

function Option49() {
  return <div className="h-0 shrink-0 w-full" data-name="option" />;
}

function Option50() {
  return <div className="h-0 shrink-0 w-full" data-name="option" />;
}

function Option51() {
  return <div className="h-0 shrink-0 w-full" data-name="option" />;
}

function Option52() {
  return <div className="h-0 shrink-0 w-full" data-name="option" />;
}

function Option53() {
  return <div className="h-0 shrink-0 w-full" data-name="option" />;
}

function Option54() {
  return <div className="h-0 shrink-0 w-full" data-name="option" />;
}

function Option55() {
  return <div className="h-0 shrink-0 w-full" data-name="option" />;
}

function Option56() {
  return <div className="h-0 shrink-0 w-full" data-name="option" />;
}

function Option57() {
  return <div className="h-0 shrink-0 w-full" data-name="option" />;
}

function Option58() {
  return <div className="h-0 shrink-0 w-full" data-name="option" />;
}

function Option59() {
  return <div className="h-0 shrink-0 w-full" data-name="option" />;
}

function Option60() {
  return <div className="h-0 shrink-0 w-full" data-name="option" />;
}

function Select4() {
  return (
    <div className="absolute content-stretch flex flex-col h-[36px] items-start left-[466px] pb-[0.8px] pl-[-514.8px] pr-[746.8px] pt-[-2784.938px] rounded-[14px] top-0 w-[232px]" data-name="select">
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[14px]" />
      <Option49 />
      <Option50 />
      <Option51 />
      <Option52 />
      <Option53 />
      <Option54 />
      <Option55 />
      <Option56 />
      <Option57 />
      <Option58 />
      <Option59 />
      <Option60 />
    </div>
  );
}

function Search18() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Search">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Search">
          <path d={svgPaths.p107a080} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d="M14 14L11.1333 11.1333" id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Button52() {
  return (
    <div className="absolute bg-[#030213] content-stretch flex h-[32px] items-center justify-center left-[706px] rounded-[14px] top-0 w-[36px]" data-name="Button">
      <Search18 />
    </div>
  );
}

function Input14() {
  return (
    <div className="absolute bg-[#f3f3f5] h-[36px] left-0 rounded-[14px] top-0 w-[458px]" data-name="Input">
      <div className="content-stretch flex items-center overflow-clip px-[12px] py-[4px] relative rounded-[inherit] size-full">
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#717182] text-[14px]">Search LOC Name Authority File...</p>
      </div>
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[14px]" />
    </div>
  );
}

function Search19() {
  return (
    <div className="absolute left-[12px] size-[16px] top-[10px]" data-name="Search">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Search">
          <path d={svgPaths.p107a080} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d="M14 14L11.1333 11.1333" id="Vector_2" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Container119() {
  return (
    <div className="absolute h-[36px] left-0 top-0 w-[458px]" data-name="Container">
      <Input14 />
      <Search19 />
    </div>
  );
}

function Container118() {
  return (
    <div className="h-[36px] relative shrink-0 w-full" data-name="Container">
      <Select4 />
      <Button52 />
      <Container119 />
    </div>
  );
}

function Container114() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] h-[91.588px] items-start relative shrink-0 w-full" data-name="Container">
      <Container115 />
      <Container117 />
      <Container118 />
    </div>
  );
}

function Label23() {
  return (
    <div className="h-[20px] relative shrink-0 w-[150.363px]" data-name="Label">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center relative size-full">
        <p className="font-['Inter:Medium',sans-serif] font-medium leading-[20px] not-italic relative shrink-0 text-[#0a0a0a] text-[14px]">Additional Contributors</p>
      </div>
    </div>
  );
}

function Badge47() {
  return (
    <div className="h-[21.587px] relative rounded-[14px] shrink-0 w-[37.4px]" data-name="Badge">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center overflow-clip px-[8.8px] py-[2.8px] relative rounded-[inherit] size-full">
        <p className="font-['Consolas:Medium',sans-serif] leading-[16px] not-italic relative shrink-0 text-[#0a0a0a] text-[12px]">700</p>
      </div>
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[14px]" />
    </div>
  );
}

function Badge48() {
  return (
    <div className="bg-[#eceef2] h-[21.587px] relative rounded-[14px] shrink-0 w-[85.563px]" data-name="Badge">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center overflow-clip px-[8.8px] py-[2.8px] relative rounded-[inherit] size-full">
        <p className="font-['Inter:Medium',sans-serif] font-medium leading-[16px] not-italic relative shrink-0 text-[#030213] text-[12px]">LOC-NAMES</p>
      </div>
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[14px]" />
    </div>
  );
}

function Badge49() {
  return (
    <div className="bg-[#155dfc] h-[21.587px] relative rounded-[14px] shrink-0 w-[40.788px]" data-name="Badge">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center overflow-clip px-[8.8px] py-[2.8px] relative rounded-[inherit] size-full">
        <p className="font-['Inter:Medium',sans-serif] font-medium leading-[16px] not-italic relative shrink-0 text-[12px] text-white">LOD</p>
      </div>
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[14px]" />
    </div>
  );
}

function Container122() {
  return (
    <div className="h-[21.587px] relative shrink-0 w-[338.113px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] items-center relative size-full">
        <Label23 />
        <Badge47 />
        <Badge48 />
        <Badge49 />
      </div>
    </div>
  );
}

function HelpCircle21() {
  return (
    <div className="h-[16px] overflow-clip relative shrink-0 w-full" data-name="HelpCircle">
      <div className="absolute inset-[8.33%]" data-name="Vector">
        <div className="absolute inset-[-5%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14.6667 14.6667">
            <path d={svgPaths.p3d62dd80} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[29.15%_37.83%_45.83%_37.87%]" data-name="Vector">
        <div className="absolute inset-[-16.65%_-17.15%_-16.66%_-17.16%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5.22018 5.3365">
            <path d={svgPaths.pb91f080} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
      <div className="absolute bottom-[29.17%] left-1/2 right-[49.96%] top-[70.83%]" data-name="Vector">
        <div className="absolute inset-[-0.67px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1.34 1.33333">
            <path d="M0.666667 0.666667H0.673334" id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Button53() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <HelpCircle21 />
      </div>
    </div>
  );
}

function Container121() {
  return (
    <div className="h-[21.587px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between relative size-full">
          <Container122 />
          <Button53 />
        </div>
      </div>
    </div>
  );
}

function Container123() {
  return (
    <div className="h-[18px] overflow-clip relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Consolas:Regular',sans-serif] leading-[18px] left-0 not-italic text-[#6a7282] text-[12px] top-[-0.4px]">bf:contribution/additional</p>
    </div>
  );
}

function Option61() {
  return <div className="h-0 shrink-0 w-full" data-name="option" />;
}

function Option62() {
  return <div className="h-0 shrink-0 w-full" data-name="option" />;
}

function Option63() {
  return <div className="h-0 shrink-0 w-full" data-name="option" />;
}

function Option64() {
  return <div className="h-0 shrink-0 w-full" data-name="option" />;
}

function Option65() {
  return <div className="h-0 shrink-0 w-full" data-name="option" />;
}

function Option66() {
  return <div className="h-0 shrink-0 w-full" data-name="option" />;
}

function Option67() {
  return <div className="h-0 shrink-0 w-full" data-name="option" />;
}

function Option68() {
  return <div className="h-0 shrink-0 w-full" data-name="option" />;
}

function Option69() {
  return <div className="h-0 shrink-0 w-full" data-name="option" />;
}

function Option70() {
  return <div className="h-0 shrink-0 w-full" data-name="option" />;
}

function Option71() {
  return <div className="h-0 shrink-0 w-full" data-name="option" />;
}

function Option72() {
  return <div className="h-0 shrink-0 w-full" data-name="option" />;
}

function Select5() {
  return (
    <div className="absolute content-stretch flex flex-col h-[36px] items-start left-[466px] pb-[0.8px] pl-[-514.8px] pr-[746.8px] pt-[-2892.525px] rounded-[14px] top-0 w-[232px]" data-name="select">
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[14px]" />
      <Option61 />
      <Option62 />
      <Option63 />
      <Option64 />
      <Option65 />
      <Option66 />
      <Option67 />
      <Option68 />
      <Option69 />
      <Option70 />
      <Option71 />
      <Option72 />
    </div>
  );
}

function Search20() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Search">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Search">
          <path d={svgPaths.p107a080} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d="M14 14L11.1333 11.1333" id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Button54() {
  return (
    <div className="absolute bg-[#030213] content-stretch flex h-[32px] items-center justify-center left-[706px] rounded-[14px] top-0 w-[36px]" data-name="Button">
      <Search20 />
    </div>
  );
}

function Input15() {
  return (
    <div className="absolute bg-[#f3f3f5] h-[36px] left-0 rounded-[14px] top-0 w-[458px]" data-name="Input">
      <div className="content-stretch flex items-center overflow-clip px-[12px] py-[4px] relative rounded-[inherit] size-full">
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#717182] text-[14px]">Search LOC Name Authority File...</p>
      </div>
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[14px]" />
    </div>
  );
}

function Search21() {
  return (
    <div className="absolute left-[12px] size-[16px] top-[10px]" data-name="Search">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Search">
          <path d={svgPaths.p107a080} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d="M14 14L11.1333 11.1333" id="Vector_2" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Container125() {
  return (
    <div className="absolute h-[36px] left-0 top-0 w-[458px]" data-name="Container">
      <Input15 />
      <Search21 />
    </div>
  );
}

function Container124() {
  return (
    <div className="h-[36px] relative shrink-0 w-full" data-name="Container">
      <Select5 />
      <Button54 />
      <Container125 />
    </div>
  );
}

function Container120() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] h-[91.588px] items-start relative shrink-0 w-full" data-name="Container">
      <Container121 />
      <Container123 />
      <Container124 />
    </div>
  );
}

function Label24() {
  return (
    <div className="h-[20px] relative shrink-0 w-[157.163px]" data-name="Label">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center relative size-full">
        <p className="font-['Inter:Medium',sans-serif] font-medium leading-[20px] not-italic relative shrink-0 text-[#0a0a0a] text-[14px]">Administrative Metadata</p>
      </div>
    </div>
  );
}

function Badge50() {
  return (
    <div className="h-[21.587px] relative rounded-[14px] shrink-0 w-[37.4px]" data-name="Badge">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center overflow-clip px-[8.8px] py-[2.8px] relative rounded-[inherit] size-full">
        <p className="font-['Consolas:Medium',sans-serif] leading-[16px] not-italic relative shrink-0 text-[#0a0a0a] text-[12px]">040</p>
      </div>
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[14px]" />
    </div>
  );
}

function Container128() {
  return (
    <div className="h-[21.587px] relative shrink-0 w-[202.563px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] items-center relative size-full">
        <Label24 />
        <Badge50 />
      </div>
    </div>
  );
}

function HelpCircle22() {
  return (
    <div className="h-[16px] overflow-clip relative shrink-0 w-full" data-name="HelpCircle">
      <div className="absolute inset-[8.33%]" data-name="Vector">
        <div className="absolute inset-[-5%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14.6667 14.6667">
            <path d={svgPaths.p3d62dd80} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[29.15%_37.83%_45.83%_37.87%]" data-name="Vector">
        <div className="absolute inset-[-16.65%_-17.15%_-16.66%_-17.16%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5.22018 5.3365">
            <path d={svgPaths.pb91f080} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
      <div className="absolute bottom-[29.17%] left-1/2 right-[49.96%] top-[70.83%]" data-name="Vector">
        <div className="absolute inset-[-0.67px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1.34 1.33333">
            <path d="M0.666667 0.666667H0.673334" id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Button55() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <HelpCircle22 />
      </div>
    </div>
  );
}

function Container127() {
  return (
    <div className="h-[21.587px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between relative size-full">
          <Container128 />
          <Button55 />
        </div>
      </div>
    </div>
  );
}

function Container129() {
  return (
    <div className="h-[18px] overflow-clip relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Consolas:Regular',sans-serif] leading-[18px] left-0 not-italic text-[#6a7282] text-[12px] top-[-0.4px]">bf:adminMetadata</p>
    </div>
  );
}

function Input16() {
  return (
    <div className="bg-[#f3f3f5] h-[36px] relative rounded-[14px] shrink-0 w-full" data-name="Input">
      <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex items-center px-[12px] py-[4px] relative size-full">
          <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#717182] text-[14px]">Enter administrative metadata...</p>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[14px]" />
    </div>
  );
}

function Container126() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] h-[91.588px] items-start relative shrink-0 w-full" data-name="Container">
      <Container127 />
      <Container129 />
      <Input16 />
    </div>
  );
}

function Container12() {
  return (
    <div className="h-[584.4px] relative shrink-0 w-full" data-name="Container">
      <div className="overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex flex-col gap-[16px] items-start pr-[8px] relative size-full">
          <Container13 />
          <Container20 />
          <Container26 />
          <Container32 />
          <Container36 />
          <Container42 />
          <Container46 />
          <Container50 />
          <Container56 />
          <Container60 />
          <Container66 />
          <Container70 />
          <Container74 />
          <Container78 />
          <Container82 />
          <Container86 />
          <Container90 />
          <Container96 />
          <Container102 />
          <Container108 />
          <Container114 />
          <Container120 />
          <Container126 />
        </div>
      </div>
    </div>
  );
}

function Container10() {
  return (
    <div className="bg-[rgba(255,255,255,0.75)] h-[678px] relative rounded-[20px] shrink-0 w-[799.6px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(255,255,255,0.3)] border-solid inset-0 pointer-events-none rounded-[20px] shadow-[0px_8px_32px_0px_rgba(31,38,135,0.15)]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[16px] items-start pb-[0.8px] pt-[24.8px] px-[24.8px] relative size-full">
        <Container11 />
        <Container12 />
      </div>
      <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.6)]" />
    </div>
  );
}

function Package() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Package">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Package">
          <path d={svgPaths.p20f4ecf0} id="Vector" stroke="var(--stroke-0, #9810FA)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d="M10 18.3333V10" id="Vector_2" stroke="var(--stroke-0, #9810FA)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d={svgPaths.p2eca8c80} id="Vector_3" stroke="var(--stroke-0, #9810FA)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d="M6.25 3.55833L13.75 7.85" id="Vector_4" stroke="var(--stroke-0, #9810FA)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
        </g>
      </svg>
    </div>
  );
}

function H2() {
  return (
    <div className="h-[28px] relative shrink-0 w-[75.113px]" data-name="h3">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Bold',sans-serif] font-bold leading-[28px] left-0 not-italic text-[#0a0a0a] text-[20px] top-[-1.2px] tracking-[-0.4px]">Instance</p>
      </div>
    </div>
  );
}

function Container131() {
  return (
    <div className="content-stretch flex gap-[8px] h-[28px] items-center relative shrink-0 w-full" data-name="Container">
      <Package />
      <H2 />
    </div>
  );
}

function Span1() {
  return (
    <div className="absolute h-[20px] left-[39.54px] top-0 w-[6.088px]" data-name="span">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-0 not-italic text-[#fb2c36] text-[14px] top-[-0.2px]">*</p>
    </div>
  );
}

function Label25() {
  return (
    <div className="flex-[1_0_0] h-[20px] min-h-px min-w-px relative" data-name="Label">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-0 not-italic text-[#0a0a0a] text-[14px] top-[-0.2px]">Title</p>
        <Span1 />
      </div>
    </div>
  );
}

function Badge51() {
  return (
    <div className="h-[21.587px] relative rounded-[14px] shrink-0 w-[37.4px]" data-name="Badge">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center overflow-clip px-[8.8px] py-[2.8px] relative rounded-[inherit] size-full">
        <p className="font-['Consolas:Medium',sans-serif] leading-[16px] not-italic relative shrink-0 text-[#0a0a0a] text-[12px]">130</p>
      </div>
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[14px]" />
    </div>
  );
}

function Container135() {
  return (
    <div className="h-[21.587px] relative shrink-0 w-[91.025px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] items-center relative size-full">
        <Label25 />
        <Badge51 />
      </div>
    </div>
  );
}

function HelpCircle23() {
  return (
    <div className="h-[16px] overflow-clip relative shrink-0 w-full" data-name="HelpCircle">
      <div className="absolute inset-[8.33%]" data-name="Vector">
        <div className="absolute inset-[-5%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14.6667 14.6667">
            <path d={svgPaths.p3d62dd80} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[29.15%_37.83%_45.83%_37.87%]" data-name="Vector">
        <div className="absolute inset-[-16.65%_-17.15%_-16.66%_-17.16%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5.22018 5.3365">
            <path d={svgPaths.pb91f080} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
      <div className="absolute bottom-[29.17%] left-1/2 right-[49.96%] top-[70.83%]" data-name="Vector">
        <div className="absolute inset-[-0.67px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1.34 1.33333">
            <path d="M0.666667 0.666667H0.673334" id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Button56() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <HelpCircle23 />
      </div>
    </div>
  );
}

function Container134() {
  return (
    <div className="content-stretch flex h-[21.587px] items-center justify-between relative shrink-0 w-full" data-name="Container">
      <Container135 />
      <Button56 />
    </div>
  );
}

function Container136() {
  return (
    <div className="h-[18px] overflow-clip relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Consolas:Regular',sans-serif] leading-[18px] left-0 not-italic text-[#6a7282] text-[12px] top-[-0.4px]">bf:title</p>
    </div>
  );
}

function Label26() {
  return (
    <div className="content-stretch flex h-[20px] items-center relative shrink-0 w-full" data-name="Label">
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[20px] not-italic relative shrink-0 text-[#4a5565] text-[14px]">Main Title</p>
    </div>
  );
}

function Input17() {
  return (
    <div className="bg-[#f3f3f5] h-[36px] relative rounded-[14px] shrink-0 w-full" data-name="Input">
      <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex items-center px-[12px] py-[4px] relative size-full">
          <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#717182] text-[14px]">Main title of the work</p>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[14px]" />
    </div>
  );
}

function Container138() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] h-[60px] items-start relative shrink-0 w-full" data-name="Container">
      <Label26 />
      <Input17 />
    </div>
  );
}

function Label27() {
  return (
    <div className="content-stretch flex h-[20px] items-center relative shrink-0 w-full" data-name="Label">
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[20px] not-italic relative shrink-0 text-[#4a5565] text-[14px]">Subtitle (optional)</p>
    </div>
  );
}

function Input18() {
  return (
    <div className="bg-[#f3f3f5] h-[36px] relative rounded-[14px] shrink-0 w-full" data-name="Input">
      <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex items-center px-[12px] py-[4px] relative size-full">
          <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#717182] text-[14px]">Subtitle if applicable</p>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[14px]" />
    </div>
  );
}

function Container139() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] h-[60px] items-start relative shrink-0 w-full" data-name="Container">
      <Label27 />
      <Input18 />
    </div>
  );
}

function Container137() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] h-[132px] items-start relative shrink-0 w-full" data-name="Container">
      <Container138 />
      <Container139 />
    </div>
  );
}

function Container133() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] h-[187.588px] items-start relative shrink-0 w-full" data-name="Container">
      <Container134 />
      <Container136 />
      <Container137 />
    </div>
  );
}

function Label28() {
  return (
    <div className="h-[20px] relative shrink-0 w-[80.975px]" data-name="Label">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center relative size-full">
        <p className="font-['Inter:Medium',sans-serif] font-medium leading-[20px] not-italic relative shrink-0 text-[#0a0a0a] text-[14px]">Contribution</p>
      </div>
    </div>
  );
}

function Badge52() {
  return (
    <div className="h-[21.587px] relative rounded-[14px] shrink-0 w-[37.4px]" data-name="Badge">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center overflow-clip px-[8.8px] py-[2.8px] relative rounded-[inherit] size-full">
        <p className="font-['Consolas:Medium',sans-serif] leading-[16px] not-italic relative shrink-0 text-[#0a0a0a] text-[12px]">100</p>
      </div>
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[14px]" />
    </div>
  );
}

function Badge53() {
  return (
    <div className="bg-[#eceef2] h-[21.587px] relative rounded-[14px] shrink-0 w-[85.563px]" data-name="Badge">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center overflow-clip px-[8.8px] py-[2.8px] relative rounded-[inherit] size-full">
        <p className="font-['Inter:Medium',sans-serif] font-medium leading-[16px] not-italic relative shrink-0 text-[#030213] text-[12px]">LOC-NAMES</p>
      </div>
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[14px]" />
    </div>
  );
}

function Badge54() {
  return (
    <div className="bg-[#155dfc] h-[21.587px] relative rounded-[14px] shrink-0 w-[40.788px]" data-name="Badge">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center overflow-clip px-[8.8px] py-[2.8px] relative rounded-[inherit] size-full">
        <p className="font-['Inter:Medium',sans-serif] font-medium leading-[16px] not-italic relative shrink-0 text-[12px] text-white">LOD</p>
      </div>
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[14px]" />
    </div>
  );
}

function Container142() {
  return (
    <div className="h-[21.587px] relative shrink-0 w-[268.725px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] items-center relative size-full">
        <Label28 />
        <Badge52 />
        <Badge53 />
        <Badge54 />
      </div>
    </div>
  );
}

function HelpCircle24() {
  return (
    <div className="h-[16px] overflow-clip relative shrink-0 w-full" data-name="HelpCircle">
      <div className="absolute inset-[8.33%]" data-name="Vector">
        <div className="absolute inset-[-5%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14.6667 14.6667">
            <path d={svgPaths.p3d62dd80} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[29.15%_37.83%_45.83%_37.87%]" data-name="Vector">
        <div className="absolute inset-[-16.65%_-17.15%_-16.66%_-17.16%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5.22018 5.3365">
            <path d={svgPaths.pb91f080} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
      <div className="absolute bottom-[29.17%] left-1/2 right-[49.96%] top-[70.83%]" data-name="Vector">
        <div className="absolute inset-[-0.67px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1.34 1.33333">
            <path d="M0.666667 0.666667H0.673334" id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Button57() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <HelpCircle24 />
      </div>
    </div>
  );
}

function Container141() {
  return (
    <div className="content-stretch flex h-[21.587px] items-center justify-between relative shrink-0 w-full" data-name="Container">
      <Container142 />
      <Button57 />
    </div>
  );
}

function Container143() {
  return (
    <div className="h-[18px] overflow-clip relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Consolas:Regular',sans-serif] leading-[18px] left-0 not-italic text-[#6a7282] text-[12px] top-[-0.4px]">bf:contribution</p>
    </div>
  );
}

function Option73() {
  return <div className="h-0 shrink-0 w-full" data-name="option" />;
}

function Option74() {
  return <div className="h-0 shrink-0 w-full" data-name="option" />;
}

function Option75() {
  return <div className="h-0 shrink-0 w-full" data-name="option" />;
}

function Option76() {
  return <div className="h-0 shrink-0 w-full" data-name="option" />;
}

function Option77() {
  return <div className="h-0 shrink-0 w-full" data-name="option" />;
}

function Option78() {
  return <div className="h-0 shrink-0 w-full" data-name="option" />;
}

function Option79() {
  return <div className="h-0 shrink-0 w-full" data-name="option" />;
}

function Option80() {
  return <div className="h-0 shrink-0 w-full" data-name="option" />;
}

function Option81() {
  return <div className="h-0 shrink-0 w-full" data-name="option" />;
}

function Option82() {
  return <div className="h-0 shrink-0 w-full" data-name="option" />;
}

function Option83() {
  return <div className="h-0 shrink-0 w-full" data-name="option" />;
}

function Option84() {
  return <div className="h-0 shrink-0 w-full" data-name="option" />;
}

function Select6() {
  return (
    <div className="absolute content-stretch flex flex-col h-[36px] items-start left-[466px] pb-[0.8px] pl-[-1338.4px] pr-[1570.4px] pt-[-623.975px] rounded-[14px] top-0 w-[232px]" data-name="select">
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[14px]" />
      <Option73 />
      <Option74 />
      <Option75 />
      <Option76 />
      <Option77 />
      <Option78 />
      <Option79 />
      <Option80 />
      <Option81 />
      <Option82 />
      <Option83 />
      <Option84 />
    </div>
  );
}

function Search22() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Search">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Search">
          <path d={svgPaths.p107a080} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d="M14 14L11.1333 11.1333" id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Button58() {
  return (
    <div className="absolute bg-[#030213] content-stretch flex h-[32px] items-center justify-center left-[706px] rounded-[14px] top-0 w-[36px]" data-name="Button">
      <Search22 />
    </div>
  );
}

function Input19() {
  return (
    <div className="absolute bg-[#f3f3f5] h-[36px] left-0 rounded-[14px] top-0 w-[458px]" data-name="Input">
      <div className="content-stretch flex items-center overflow-clip px-[12px] py-[4px] relative rounded-[inherit] size-full">
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#717182] text-[14px]">Search LOC Name Authority File...</p>
      </div>
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[14px]" />
    </div>
  );
}

function Search23() {
  return (
    <div className="absolute left-[12px] size-[16px] top-[10px]" data-name="Search">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Search">
          <path d={svgPaths.p107a080} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d="M14 14L11.1333 11.1333" id="Vector_2" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Container145() {
  return (
    <div className="absolute h-[36px] left-0 top-0 w-[458px]" data-name="Container">
      <Input19 />
      <Search23 />
    </div>
  );
}

function Container144() {
  return (
    <div className="h-[36px] relative shrink-0 w-full" data-name="Container">
      <Select6 />
      <Button58 />
      <Container145 />
    </div>
  );
}

function Container140() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] h-[91.588px] items-start relative shrink-0 w-full" data-name="Container">
      <Container141 />
      <Container143 />
      <Container144 />
    </div>
  );
}

function Label29() {
  return (
    <div className="h-[20px] relative shrink-0 w-[31.525px]" data-name="Label">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center relative size-full">
        <p className="font-['Inter:Medium',sans-serif] font-medium leading-[20px] not-italic relative shrink-0 text-[#0a0a0a] text-[14px]">Note</p>
      </div>
    </div>
  );
}

function Badge55() {
  return (
    <div className="h-[21.587px] relative rounded-[14px] shrink-0 w-[37.4px]" data-name="Badge">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center overflow-clip px-[8.8px] py-[2.8px] relative rounded-[inherit] size-full">
        <p className="font-['Consolas:Medium',sans-serif] leading-[16px] not-italic relative shrink-0 text-[#0a0a0a] text-[12px]">500</p>
      </div>
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[14px]" />
    </div>
  );
}

function Container148() {
  return (
    <div className="h-[21.587px] relative shrink-0 w-[76.925px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] items-center relative size-full">
        <Label29 />
        <Badge55 />
      </div>
    </div>
  );
}

function HelpCircle25() {
  return (
    <div className="h-[16px] overflow-clip relative shrink-0 w-full" data-name="HelpCircle">
      <div className="absolute inset-[8.33%]" data-name="Vector">
        <div className="absolute inset-[-5%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14.6667 14.6667">
            <path d={svgPaths.p3d62dd80} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[29.15%_37.83%_45.83%_37.87%]" data-name="Vector">
        <div className="absolute inset-[-16.65%_-17.15%_-16.66%_-17.16%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5.22018 5.3365">
            <path d={svgPaths.pb91f080} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
      <div className="absolute bottom-[29.17%] left-1/2 right-[49.96%] top-[70.83%]" data-name="Vector">
        <div className="absolute inset-[-0.67px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1.34 1.33333">
            <path d="M0.666667 0.666667H0.673334" id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Button59() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <HelpCircle25 />
      </div>
    </div>
  );
}

function Container147() {
  return (
    <div className="content-stretch flex h-[21.587px] items-center justify-between relative shrink-0 w-full" data-name="Container">
      <Container148 />
      <Button59 />
    </div>
  );
}

function Container149() {
  return (
    <div className="h-[18px] overflow-clip relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Consolas:Regular',sans-serif] leading-[18px] left-0 not-italic text-[#6a7282] text-[12px] top-[-0.4px]">bf:note</p>
    </div>
  );
}

function Textarea2() {
  return (
    <div className="h-[80px] relative rounded-[14px] shrink-0 w-full" data-name="textarea">
      <div className="overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex items-start p-[8px] relative size-full">
          <p className="font-['Inter:Regular',sans-serif] font-normal leading-[24px] not-italic relative shrink-0 text-[16px] text-[rgba(10,10,10,0.5)]">General note</p>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[14px]" />
    </div>
  );
}

function Container146() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] h-[141.188px] items-start relative shrink-0 w-full" data-name="Container">
      <Container147 />
      <Container149 />
      <Textarea2 />
    </div>
  );
}

function Label30() {
  return (
    <div className="h-[20px] relative shrink-0 w-[135.613px]" data-name="Label">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center relative size-full">
        <p className="font-['Inter:Medium',sans-serif] font-medium leading-[20px] not-italic relative shrink-0 text-[#0a0a0a] text-[14px]">Publication/Provision</p>
      </div>
    </div>
  );
}

function Badge56() {
  return (
    <div className="h-[21.587px] relative rounded-[14px] shrink-0 w-[37.4px]" data-name="Badge">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center overflow-clip px-[8.8px] py-[2.8px] relative rounded-[inherit] size-full">
        <p className="font-['Consolas:Medium',sans-serif] leading-[16px] not-italic relative shrink-0 text-[#0a0a0a] text-[12px]">260</p>
      </div>
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[14px]" />
    </div>
  );
}

function Container152() {
  return (
    <div className="h-[21.587px] relative shrink-0 w-[181.012px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] items-center relative size-full">
        <Label30 />
        <Badge56 />
      </div>
    </div>
  );
}

function HelpCircle26() {
  return (
    <div className="h-[16px] overflow-clip relative shrink-0 w-full" data-name="HelpCircle">
      <div className="absolute inset-[8.33%]" data-name="Vector">
        <div className="absolute inset-[-5%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14.6667 14.6667">
            <path d={svgPaths.p3d62dd80} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[29.15%_37.83%_45.83%_37.87%]" data-name="Vector">
        <div className="absolute inset-[-16.65%_-17.15%_-16.66%_-17.16%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5.22018 5.3365">
            <path d={svgPaths.pb91f080} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
      <div className="absolute bottom-[29.17%] left-1/2 right-[49.96%] top-[70.83%]" data-name="Vector">
        <div className="absolute inset-[-0.67px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1.34 1.33333">
            <path d="M0.666667 0.666667H0.673334" id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Button60() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <HelpCircle26 />
      </div>
    </div>
  );
}

function Container151() {
  return (
    <div className="content-stretch flex h-[21.587px] items-center justify-between relative shrink-0 w-full" data-name="Container">
      <Container152 />
      <Button60 />
    </div>
  );
}

function Container153() {
  return (
    <div className="h-[18px] overflow-clip relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Consolas:Regular',sans-serif] leading-[18px] left-0 not-italic text-[#6a7282] text-[12px] top-[-0.4px]">bf:provisionActivity</p>
    </div>
  );
}

function Input20() {
  return (
    <div className="bg-[#f3f3f5] h-[36px] relative rounded-[14px] shrink-0 w-full" data-name="Input">
      <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex items-center px-[12px] py-[4px] relative size-full">
          <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#717182] text-[14px]">Enter publication/provision...</p>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[14px]" />
    </div>
  );
}

function Container150() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] h-[91.588px] items-start relative shrink-0 w-full" data-name="Container">
      <Container151 />
      <Container153 />
      <Input20 />
    </div>
  );
}

function Label31() {
  return (
    <div className="h-[20px] relative shrink-0 w-[57.95px]" data-name="Label">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center relative size-full">
        <p className="font-['Inter:Medium',sans-serif] font-medium leading-[20px] not-italic relative shrink-0 text-[#0a0a0a] text-[14px]">Identifier</p>
      </div>
    </div>
  );
}

function Badge57() {
  return (
    <div className="h-[21.587px] relative rounded-[14px] shrink-0 w-[37.4px]" data-name="Badge">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center overflow-clip px-[8.8px] py-[2.8px] relative rounded-[inherit] size-full">
        <p className="font-['Consolas:Medium',sans-serif] leading-[16px] not-italic relative shrink-0 text-[#0a0a0a] text-[12px]">010</p>
      </div>
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[14px]" />
    </div>
  );
}

function Container156() {
  return (
    <div className="h-[21.587px] relative shrink-0 w-[103.35px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] items-center relative size-full">
        <Label31 />
        <Badge57 />
      </div>
    </div>
  );
}

function HelpCircle27() {
  return (
    <div className="h-[16px] overflow-clip relative shrink-0 w-full" data-name="HelpCircle">
      <div className="absolute inset-[8.33%]" data-name="Vector">
        <div className="absolute inset-[-5%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14.6667 14.6667">
            <path d={svgPaths.p3d62dd80} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[29.15%_37.83%_45.83%_37.87%]" data-name="Vector">
        <div className="absolute inset-[-16.65%_-17.15%_-16.66%_-17.16%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5.22018 5.3365">
            <path d={svgPaths.pb91f080} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
      <div className="absolute bottom-[29.17%] left-1/2 right-[49.96%] top-[70.83%]" data-name="Vector">
        <div className="absolute inset-[-0.67px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1.34 1.33333">
            <path d="M0.666667 0.666667H0.673334" id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Button61() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <HelpCircle27 />
      </div>
    </div>
  );
}

function Container155() {
  return (
    <div className="content-stretch flex h-[21.587px] items-center justify-between relative shrink-0 w-full" data-name="Container">
      <Container156 />
      <Button61 />
    </div>
  );
}

function Container157() {
  return (
    <div className="h-[18px] overflow-clip relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Consolas:Regular',sans-serif] leading-[18px] left-0 not-italic text-[#6a7282] text-[12px] top-[-0.4px]">bf:identifiedBy</p>
    </div>
  );
}

function Label32() {
  return (
    <div className="content-stretch flex h-[20px] items-center relative shrink-0 w-full" data-name="Label">
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[20px] not-italic relative shrink-0 text-[#4a5565] text-[14px]">ISBN</p>
    </div>
  );
}

function Input21() {
  return (
    <div className="bg-[#f3f3f5] flex-[1_0_0] h-[36px] min-h-px min-w-px relative rounded-[14px]" data-name="Input">
      <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center px-[12px] py-[4px] relative size-full">
          <p className="font-['Consolas:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#717182] text-[14px]">978-...</p>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[14px]" />
    </div>
  );
}

function Search24() {
  return (
    <div className="absolute left-[12px] size-[16px] top-[10px]" data-name="Search">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Search">
          <path d={svgPaths.p107a080} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d="M14 14L11.1333 11.1333" id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Button62() {
  return (
    <div className="bg-gradient-to-r from-[#9810fa] h-[36px] opacity-50 relative rounded-[14px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)] shrink-0 to-[#155dfc] w-[100.537px]" data-name="button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Search24 />
        <p className="-translate-x-1/2 absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[20px] left-[61px] not-italic text-[14px] text-center text-white top-[7.8px]">{` Auto-Fill`}</p>
      </div>
    </div>
  );
}

function Container160() {
  return (
    <div className="content-stretch flex gap-[8px] h-[36px] items-start relative shrink-0 w-full" data-name="Container">
      <Input21 />
      <Button62 />
    </div>
  );
}

function Container159() {
  return (
    <div className="col-1 content-stretch flex flex-col gap-[4px] items-start justify-self-stretch relative row-1 self-stretch shrink-0" data-name="Container">
      <Label32 />
      <Container160 />
    </div>
  );
}

function Label33() {
  return (
    <div className="content-stretch flex h-[20px] items-center relative shrink-0 w-full" data-name="Label">
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[20px] not-italic relative shrink-0 text-[#4a5565] text-[14px]">LCCN</p>
    </div>
  );
}

function Input22() {
  return (
    <div className="bg-[#f3f3f5] h-[36px] relative rounded-[14px] shrink-0 w-full" data-name="Input">
      <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex items-center px-[12px] py-[4px] relative size-full">
          <p className="font-['Consolas:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#717182] text-[14px]">2024...</p>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[14px]" />
    </div>
  );
}

function Container161() {
  return (
    <div className="col-2 content-stretch flex flex-col gap-[4px] items-start justify-self-stretch relative row-1 self-stretch shrink-0" data-name="Container">
      <Label33 />
      <Input22 />
    </div>
  );
}

function Container158() {
  return (
    <div className="gap-x-[12px] gap-y-[12px] grid grid-cols-[repeat(2,minmax(0,1fr))] grid-rows-[repeat(1,minmax(0,1fr))] h-[60px] relative shrink-0 w-full" data-name="Container">
      <Container159 />
      <Container161 />
    </div>
  );
}

function Container154() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] h-[115.588px] items-start relative shrink-0 w-full" data-name="Container">
      <Container155 />
      <Container157 />
      <Container158 />
    </div>
  );
}

function Label34() {
  return (
    <div className="h-[20px] relative shrink-0 w-[39.913px]" data-name="Label">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center relative size-full">
        <p className="font-['Inter:Medium',sans-serif] font-medium leading-[20px] not-italic relative shrink-0 text-[#0a0a0a] text-[14px]">Extent</p>
      </div>
    </div>
  );
}

function Badge58() {
  return (
    <div className="h-[21.587px] relative rounded-[14px] shrink-0 w-[50.6px]" data-name="Badge">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center overflow-clip px-[8.8px] py-[2.8px] relative rounded-[inherit] size-full">
        <p className="font-['Consolas:Medium',sans-serif] leading-[16px] not-italic relative shrink-0 text-[#0a0a0a] text-[12px]">300$a</p>
      </div>
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[14px]" />
    </div>
  );
}

function Container164() {
  return (
    <div className="h-[21.587px] relative shrink-0 w-[98.513px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] items-center relative size-full">
        <Label34 />
        <Badge58 />
      </div>
    </div>
  );
}

function HelpCircle28() {
  return (
    <div className="h-[16px] overflow-clip relative shrink-0 w-full" data-name="HelpCircle">
      <div className="absolute inset-[8.33%]" data-name="Vector">
        <div className="absolute inset-[-5%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14.6667 14.6667">
            <path d={svgPaths.p3d62dd80} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[29.15%_37.83%_45.83%_37.87%]" data-name="Vector">
        <div className="absolute inset-[-16.65%_-17.15%_-16.66%_-17.16%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5.22018 5.3365">
            <path d={svgPaths.pb91f080} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
      <div className="absolute bottom-[29.17%] left-1/2 right-[49.96%] top-[70.83%]" data-name="Vector">
        <div className="absolute inset-[-0.67px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1.34 1.33333">
            <path d="M0.666667 0.666667H0.673334" id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Button63() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <HelpCircle28 />
      </div>
    </div>
  );
}

function Container163() {
  return (
    <div className="content-stretch flex h-[21.587px] items-center justify-between relative shrink-0 w-full" data-name="Container">
      <Container164 />
      <Button63 />
    </div>
  );
}

function Container165() {
  return (
    <div className="h-[18px] overflow-clip relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Consolas:Regular',sans-serif] leading-[18px] left-0 not-italic text-[#6a7282] text-[12px] top-[-0.4px]">bf:extent</p>
    </div>
  );
}

function Input23() {
  return (
    <div className="bg-[#f3f3f5] h-[36px] relative rounded-[14px] shrink-0 w-full" data-name="Input">
      <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex items-center px-[12px] py-[4px] relative size-full">
          <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#717182] text-[14px]">e.g., 340 pages</p>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[14px]" />
    </div>
  );
}

function Container162() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] h-[91.588px] items-start relative shrink-0 w-full" data-name="Container">
      <Container163 />
      <Container165 />
      <Input23 />
    </div>
  );
}

function Label35() {
  return (
    <div className="h-[20px] relative shrink-0 w-[73.975px]" data-name="Label">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center relative size-full">
        <p className="font-['Inter:Medium',sans-serif] font-medium leading-[20px] not-italic relative shrink-0 text-[#0a0a0a] text-[14px]">Dimensions</p>
      </div>
    </div>
  );
}

function Badge59() {
  return (
    <div className="h-[21.587px] relative rounded-[14px] shrink-0 w-[50.6px]" data-name="Badge">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center overflow-clip px-[8.8px] py-[2.8px] relative rounded-[inherit] size-full">
        <p className="font-['Consolas:Medium',sans-serif] leading-[16px] not-italic relative shrink-0 text-[#0a0a0a] text-[12px]">300$c</p>
      </div>
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[14px]" />
    </div>
  );
}

function Container168() {
  return (
    <div className="h-[21.587px] relative shrink-0 w-[132.575px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] items-center relative size-full">
        <Label35 />
        <Badge59 />
      </div>
    </div>
  );
}

function HelpCircle29() {
  return (
    <div className="h-[16px] overflow-clip relative shrink-0 w-full" data-name="HelpCircle">
      <div className="absolute inset-[8.33%]" data-name="Vector">
        <div className="absolute inset-[-5%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14.6667 14.6667">
            <path d={svgPaths.p3d62dd80} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[29.15%_37.83%_45.83%_37.87%]" data-name="Vector">
        <div className="absolute inset-[-16.65%_-17.15%_-16.66%_-17.16%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5.22018 5.3365">
            <path d={svgPaths.pb91f080} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
      <div className="absolute bottom-[29.17%] left-1/2 right-[49.96%] top-[70.83%]" data-name="Vector">
        <div className="absolute inset-[-0.67px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1.34 1.33333">
            <path d="M0.666667 0.666667H0.673334" id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Button64() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <HelpCircle29 />
      </div>
    </div>
  );
}

function Container167() {
  return (
    <div className="content-stretch flex h-[21.587px] items-center justify-between relative shrink-0 w-full" data-name="Container">
      <Container168 />
      <Button64 />
    </div>
  );
}

function Container169() {
  return (
    <div className="h-[18px] overflow-clip relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Consolas:Regular',sans-serif] leading-[18px] left-0 not-italic text-[#6a7282] text-[12px] top-[-0.4px]">bf:dimensions</p>
    </div>
  );
}

function Input24() {
  return (
    <div className="bg-[#f3f3f5] h-[36px] relative rounded-[14px] shrink-0 w-full" data-name="Input">
      <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex items-center px-[12px] py-[4px] relative size-full">
          <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#717182] text-[14px]">Enter dimensions...</p>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[14px]" />
    </div>
  );
}

function Container166() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] h-[91.588px] items-start relative shrink-0 w-full" data-name="Container">
      <Container167 />
      <Container169 />
      <Input24 />
    </div>
  );
}

function Label36() {
  return (
    <div className="h-[20px] relative shrink-0 w-[73.638px]" data-name="Label">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center relative size-full">
        <p className="font-['Inter:Medium',sans-serif] font-medium leading-[20px] not-italic relative shrink-0 text-[#0a0a0a] text-[14px]">Media Type</p>
      </div>
    </div>
  );
}

function Badge60() {
  return (
    <div className="h-[21.587px] relative rounded-[14px] shrink-0 w-[37.4px]" data-name="Badge">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center overflow-clip px-[8.8px] py-[2.8px] relative rounded-[inherit] size-full">
        <p className="font-['Consolas:Medium',sans-serif] leading-[16px] not-italic relative shrink-0 text-[#0a0a0a] text-[12px]">337</p>
      </div>
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[14px]" />
    </div>
  );
}

function Badge61() {
  return (
    <div className="bg-[#eceef2] h-[21.587px] relative rounded-[14px] shrink-0 w-[85.85px]" data-name="Badge">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center overflow-clip px-[8.8px] py-[2.8px] relative rounded-[inherit] size-full">
        <p className="font-['Inter:Medium',sans-serif] font-medium leading-[16px] not-italic relative shrink-0 text-[#030213] text-[12px]">RDA-VOCAB</p>
      </div>
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[14px]" />
    </div>
  );
}

function Badge62() {
  return (
    <div className="bg-[#155dfc] h-[21.587px] relative rounded-[14px] shrink-0 w-[40.788px]" data-name="Badge">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center overflow-clip px-[8.8px] py-[2.8px] relative rounded-[inherit] size-full">
        <p className="font-['Inter:Medium',sans-serif] font-medium leading-[16px] not-italic relative shrink-0 text-[12px] text-white">LOD</p>
      </div>
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[14px]" />
    </div>
  );
}

function Container172() {
  return (
    <div className="h-[21.587px] relative shrink-0 w-[261.675px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] items-center relative size-full">
        <Label36 />
        <Badge60 />
        <Badge61 />
        <Badge62 />
      </div>
    </div>
  );
}

function HelpCircle30() {
  return (
    <div className="h-[16px] overflow-clip relative shrink-0 w-full" data-name="HelpCircle">
      <div className="absolute inset-[8.33%]" data-name="Vector">
        <div className="absolute inset-[-5%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14.6667 14.6667">
            <path d={svgPaths.p3d62dd80} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[29.15%_37.83%_45.83%_37.87%]" data-name="Vector">
        <div className="absolute inset-[-16.65%_-17.15%_-16.66%_-17.16%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5.22018 5.3365">
            <path d={svgPaths.pb91f080} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
      <div className="absolute bottom-[29.17%] left-1/2 right-[49.96%] top-[70.83%]" data-name="Vector">
        <div className="absolute inset-[-0.67px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1.34 1.33333">
            <path d="M0.666667 0.666667H0.673334" id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Button65() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <HelpCircle30 />
      </div>
    </div>
  );
}

function Container171() {
  return (
    <div className="content-stretch flex h-[21.587px] items-center justify-between relative shrink-0 w-full" data-name="Container">
      <Container172 />
      <Button65 />
    </div>
  );
}

function Container173() {
  return (
    <div className="h-[18px] overflow-clip relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Consolas:Regular',sans-serif] leading-[18px] left-0 not-italic text-[#6a7282] text-[12px] top-[-0.4px]">bf:media</p>
    </div>
  );
}

function Option85() {
  return <div className="absolute left-[-872.4px] size-0 top-[-1343.1px]" data-name="option" />;
}

function Option86() {
  return <div className="absolute left-[-872.4px] size-0 top-[-1343.1px]" data-name="option" />;
}

function Option87() {
  return <div className="absolute left-[-872.4px] size-0 top-[-1343.1px]" data-name="option" />;
}

function Option88() {
  return <div className="absolute left-[-872.4px] size-0 top-[-1343.1px]" data-name="option" />;
}

function Option89() {
  return <div className="absolute left-[-872.4px] size-0 top-[-1343.1px]" data-name="option" />;
}

function Option90() {
  return <div className="absolute left-[-872.4px] size-0 top-[-1343.1px]" data-name="option" />;
}

function Option91() {
  return <div className="absolute left-[-872.4px] size-0 top-[-1343.1px]" data-name="option" />;
}

function Option92() {
  return <div className="absolute left-[-872.4px] size-0 top-[-1343.1px]" data-name="option" />;
}

function Option93() {
  return <div className="absolute left-[-872.4px] size-0 top-[-1343.1px]" data-name="option" />;
}

function Option94() {
  return <div className="absolute left-[-872.4px] size-0 top-[-1343.1px]" data-name="option" />;
}

function Option95() {
  return <div className="absolute left-[-872.4px] size-0 top-[-1343.1px]" data-name="option" />;
}

function Select7() {
  return (
    <div className="h-[40.8px] relative rounded-[14px] shrink-0 w-full" data-name="select">
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[14px]" />
      <Option85 />
      <Option86 />
      <Option87 />
      <Option88 />
      <Option89 />
      <Option90 />
      <Option91 />
      <Option92 />
      <Option93 />
      <Option94 />
      <Option95 />
    </div>
  );
}

function Container170() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] h-[96.388px] items-start relative shrink-0 w-full" data-name="Container">
      <Container171 />
      <Container173 />
      <Select7 />
    </div>
  );
}

function Label37() {
  return (
    <div className="h-[20px] relative shrink-0 w-[76.5px]" data-name="Label">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center relative size-full">
        <p className="font-['Inter:Medium',sans-serif] font-medium leading-[20px] not-italic relative shrink-0 text-[#0a0a0a] text-[14px]">Carrier Type</p>
      </div>
    </div>
  );
}

function Badge63() {
  return (
    <div className="h-[21.587px] relative rounded-[14px] shrink-0 w-[37.4px]" data-name="Badge">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center overflow-clip px-[8.8px] py-[2.8px] relative rounded-[inherit] size-full">
        <p className="font-['Consolas:Medium',sans-serif] leading-[16px] not-italic relative shrink-0 text-[#0a0a0a] text-[12px]">338</p>
      </div>
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[14px]" />
    </div>
  );
}

function Badge64() {
  return (
    <div className="bg-[#eceef2] h-[21.587px] relative rounded-[14px] shrink-0 w-[85.85px]" data-name="Badge">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center overflow-clip px-[8.8px] py-[2.8px] relative rounded-[inherit] size-full">
        <p className="font-['Inter:Medium',sans-serif] font-medium leading-[16px] not-italic relative shrink-0 text-[#030213] text-[12px]">RDA-VOCAB</p>
      </div>
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[14px]" />
    </div>
  );
}

function Badge65() {
  return (
    <div className="bg-[#155dfc] h-[21.587px] relative rounded-[14px] shrink-0 w-[40.788px]" data-name="Badge">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center overflow-clip px-[8.8px] py-[2.8px] relative rounded-[inherit] size-full">
        <p className="font-['Inter:Medium',sans-serif] font-medium leading-[16px] not-italic relative shrink-0 text-[12px] text-white">LOD</p>
      </div>
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[14px]" />
    </div>
  );
}

function Container176() {
  return (
    <div className="h-[21.587px] relative shrink-0 w-[264.538px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] items-center relative size-full">
        <Label37 />
        <Badge63 />
        <Badge64 />
        <Badge65 />
      </div>
    </div>
  );
}

function HelpCircle31() {
  return (
    <div className="h-[16px] overflow-clip relative shrink-0 w-full" data-name="HelpCircle">
      <div className="absolute inset-[8.33%]" data-name="Vector">
        <div className="absolute inset-[-5%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14.6667 14.6667">
            <path d={svgPaths.p3d62dd80} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[29.15%_37.83%_45.83%_37.87%]" data-name="Vector">
        <div className="absolute inset-[-16.65%_-17.15%_-16.66%_-17.16%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5.22018 5.3365">
            <path d={svgPaths.pb91f080} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
      <div className="absolute bottom-[29.17%] left-1/2 right-[49.96%] top-[70.83%]" data-name="Vector">
        <div className="absolute inset-[-0.67px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1.34 1.33333">
            <path d="M0.666667 0.666667H0.673334" id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Button66() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <HelpCircle31 />
      </div>
    </div>
  );
}

function Container175() {
  return (
    <div className="content-stretch flex h-[21.587px] items-center justify-between relative shrink-0 w-full" data-name="Container">
      <Container176 />
      <Button66 />
    </div>
  );
}

function Container177() {
  return (
    <div className="h-[18px] overflow-clip relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Consolas:Regular',sans-serif] leading-[18px] left-0 not-italic text-[#6a7282] text-[12px] top-[-0.4px]">bf:carrier</p>
    </div>
  );
}

function Option96() {
  return <div className="absolute left-[-872.4px] size-0 top-[-1455.49px]" data-name="option" />;
}

function Option97() {
  return <div className="absolute left-[-872.4px] size-0 top-[-1455.49px]" data-name="option" />;
}

function Option98() {
  return <div className="absolute left-[-872.4px] size-0 top-[-1455.49px]" data-name="option" />;
}

function Option99() {
  return <div className="absolute left-[-872.4px] size-0 top-[-1455.49px]" data-name="option" />;
}

function Option100() {
  return <div className="absolute left-[-872.4px] size-0 top-[-1455.49px]" data-name="option" />;
}

function Option101() {
  return <div className="absolute left-[-872.4px] size-0 top-[-1455.49px]" data-name="option" />;
}

function Option102() {
  return <div className="absolute left-[-872.4px] size-0 top-[-1455.49px]" data-name="option" />;
}

function Option103() {
  return <div className="absolute left-[-872.4px] size-0 top-[-1455.49px]" data-name="option" />;
}

function Option104() {
  return <div className="absolute left-[-872.4px] size-0 top-[-1455.49px]" data-name="option" />;
}

function Option105() {
  return <div className="absolute left-[-872.4px] size-0 top-[-1455.49px]" data-name="option" />;
}

function Option106() {
  return <div className="absolute left-[-872.4px] size-0 top-[-1455.49px]" data-name="option" />;
}

function Option107() {
  return <div className="absolute left-[-872.4px] size-0 top-[-1455.49px]" data-name="option" />;
}

function Option108() {
  return <div className="absolute left-[-872.4px] size-0 top-[-1455.49px]" data-name="option" />;
}

function Option109() {
  return <div className="absolute left-[-872.4px] size-0 top-[-1455.49px]" data-name="option" />;
}

function Option110() {
  return <div className="absolute left-[-872.4px] size-0 top-[-1455.49px]" data-name="option" />;
}

function Option111() {
  return <div className="absolute left-[-872.4px] size-0 top-[-1455.49px]" data-name="option" />;
}

function Option112() {
  return <div className="absolute left-[-872.4px] size-0 top-[-1455.49px]" data-name="option" />;
}

function Option113() {
  return <div className="absolute left-[-872.4px] size-0 top-[-1455.49px]" data-name="option" />;
}

function Option114() {
  return <div className="absolute left-[-872.4px] size-0 top-[-1455.49px]" data-name="option" />;
}

function Option115() {
  return <div className="absolute left-[-872.4px] size-0 top-[-1455.49px]" data-name="option" />;
}

function Option116() {
  return <div className="absolute left-[-872.4px] size-0 top-[-1455.49px]" data-name="option" />;
}

function Option117() {
  return <div className="absolute left-[-872.4px] size-0 top-[-1455.49px]" data-name="option" />;
}

function Select8() {
  return (
    <div className="h-[40.8px] relative rounded-[14px] shrink-0 w-full" data-name="select">
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[14px]" />
      <Option96 />
      <Option97 />
      <Option98 />
      <Option99 />
      <Option100 />
      <Option101 />
      <Option102 />
      <Option103 />
      <Option104 />
      <Option105 />
      <Option106 />
      <Option107 />
      <Option108 />
      <Option109 />
      <Option110 />
      <Option111 />
      <Option112 />
      <Option113 />
      <Option114 />
      <Option115 />
      <Option116 />
      <Option117 />
    </div>
  );
}

function Container174() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] h-[96.388px] items-start relative shrink-0 w-full" data-name="Container">
      <Container175 />
      <Container177 />
      <Select8 />
    </div>
  );
}

function Label38() {
  return (
    <div className="h-[20px] relative shrink-0 w-[113.5px]" data-name="Label">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center relative size-full">
        <p className="font-['Inter:Medium',sans-serif] font-medium leading-[20px] not-italic relative shrink-0 text-[#0a0a0a] text-[14px]">Edition Statement</p>
      </div>
    </div>
  );
}

function Badge66() {
  return (
    <div className="h-[21.587px] relative rounded-[14px] shrink-0 w-[37.4px]" data-name="Badge">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center overflow-clip px-[8.8px] py-[2.8px] relative rounded-[inherit] size-full">
        <p className="font-['Consolas:Medium',sans-serif] leading-[16px] not-italic relative shrink-0 text-[#0a0a0a] text-[12px]">250</p>
      </div>
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[14px]" />
    </div>
  );
}

function Container180() {
  return (
    <div className="h-[21.587px] relative shrink-0 w-[158.9px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] items-center relative size-full">
        <Label38 />
        <Badge66 />
      </div>
    </div>
  );
}

function HelpCircle32() {
  return (
    <div className="h-[16px] overflow-clip relative shrink-0 w-full" data-name="HelpCircle">
      <div className="absolute inset-[8.33%]" data-name="Vector">
        <div className="absolute inset-[-5%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14.6667 14.6667">
            <path d={svgPaths.p3d62dd80} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[29.15%_37.83%_45.83%_37.87%]" data-name="Vector">
        <div className="absolute inset-[-16.65%_-17.15%_-16.66%_-17.16%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5.22018 5.3365">
            <path d={svgPaths.pb91f080} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
      <div className="absolute bottom-[29.17%] left-1/2 right-[49.96%] top-[70.83%]" data-name="Vector">
        <div className="absolute inset-[-0.67px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1.34 1.33333">
            <path d="M0.666667 0.666667H0.673334" id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Button67() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <HelpCircle32 />
      </div>
    </div>
  );
}

function Container179() {
  return (
    <div className="content-stretch flex h-[21.587px] items-center justify-between relative shrink-0 w-full" data-name="Container">
      <Container180 />
      <Button67 />
    </div>
  );
}

function Container181() {
  return (
    <div className="h-[18px] overflow-clip relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Consolas:Regular',sans-serif] leading-[18px] left-0 not-italic text-[#6a7282] text-[12px] top-[-0.4px]">bf:editionStatement</p>
    </div>
  );
}

function Input25() {
  return (
    <div className="bg-[#f3f3f5] h-[36px] relative rounded-[14px] shrink-0 w-full" data-name="Input">
      <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex items-center px-[12px] py-[4px] relative size-full">
          <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#717182] text-[14px]">Enter edition statement...</p>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[14px]" />
    </div>
  );
}

function Container178() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] h-[91.588px] items-start relative shrink-0 w-full" data-name="Container">
      <Container179 />
      <Container181 />
      <Input25 />
    </div>
  );
}

function Label39() {
  return (
    <div className="h-[20px] relative shrink-0 w-[173.788px]" data-name="Label">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center relative size-full">
        <p className="font-['Inter:Medium',sans-serif] font-medium leading-[20px] not-italic relative shrink-0 text-[#0a0a0a] text-[14px]">Statement of Responsibility</p>
      </div>
    </div>
  );
}

function Badge67() {
  return (
    <div className="h-[21.587px] relative rounded-[14px] shrink-0 w-[50.6px]" data-name="Badge">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center overflow-clip px-[8.8px] py-[2.8px] relative rounded-[inherit] size-full">
        <p className="font-['Consolas:Medium',sans-serif] leading-[16px] not-italic relative shrink-0 text-[#0a0a0a] text-[12px]">245$c</p>
      </div>
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[14px]" />
    </div>
  );
}

function Container184() {
  return (
    <div className="h-[21.587px] relative shrink-0 w-[232.387px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] items-center relative size-full">
        <Label39 />
        <Badge67 />
      </div>
    </div>
  );
}

function HelpCircle33() {
  return (
    <div className="h-[16px] overflow-clip relative shrink-0 w-full" data-name="HelpCircle">
      <div className="absolute inset-[8.33%]" data-name="Vector">
        <div className="absolute inset-[-5%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14.6667 14.6667">
            <path d={svgPaths.p3d62dd80} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[29.15%_37.83%_45.83%_37.87%]" data-name="Vector">
        <div className="absolute inset-[-16.65%_-17.15%_-16.66%_-17.16%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5.22018 5.3365">
            <path d={svgPaths.pb91f080} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
      <div className="absolute bottom-[29.17%] left-1/2 right-[49.96%] top-[70.83%]" data-name="Vector">
        <div className="absolute inset-[-0.67px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1.34 1.33333">
            <path d="M0.666667 0.666667H0.673334" id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Button68() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <HelpCircle33 />
      </div>
    </div>
  );
}

function Container183() {
  return (
    <div className="content-stretch flex h-[21.587px] items-center justify-between relative shrink-0 w-full" data-name="Container">
      <Container184 />
      <Button68 />
    </div>
  );
}

function Container185() {
  return (
    <div className="h-[18px] overflow-clip relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Consolas:Regular',sans-serif] leading-[18px] left-0 not-italic text-[#6a7282] text-[12px] top-[-0.4px]">bf:responsibilityStatement</p>
    </div>
  );
}

function Input26() {
  return (
    <div className="bg-[#f3f3f5] h-[36px] relative rounded-[14px] shrink-0 w-full" data-name="Input">
      <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex items-center px-[12px] py-[4px] relative size-full">
          <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#717182] text-[14px]">Enter statement of responsibility...</p>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[14px]" />
    </div>
  );
}

function Container182() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] h-[91.588px] items-start relative shrink-0 w-full" data-name="Container">
      <Container183 />
      <Container185 />
      <Input26 />
    </div>
  );
}

function Label40() {
  return (
    <div className="h-[20px] relative shrink-0 w-[106.287px]" data-name="Label">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center relative size-full">
        <p className="font-['Inter:Medium',sans-serif] font-medium leading-[20px] not-italic relative shrink-0 text-[#0a0a0a] text-[14px]">Series Statement</p>
      </div>
    </div>
  );
}

function Badge68() {
  return (
    <div className="h-[21.587px] relative rounded-[14px] shrink-0 w-[37.4px]" data-name="Badge">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center overflow-clip px-[8.8px] py-[2.8px] relative rounded-[inherit] size-full">
        <p className="font-['Consolas:Medium',sans-serif] leading-[16px] not-italic relative shrink-0 text-[#0a0a0a] text-[12px]">490</p>
      </div>
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[14px]" />
    </div>
  );
}

function Container188() {
  return (
    <div className="h-[21.587px] relative shrink-0 w-[151.688px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] items-center relative size-full">
        <Label40 />
        <Badge68 />
      </div>
    </div>
  );
}

function HelpCircle34() {
  return (
    <div className="h-[16px] overflow-clip relative shrink-0 w-full" data-name="HelpCircle">
      <div className="absolute inset-[8.33%]" data-name="Vector">
        <div className="absolute inset-[-5%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14.6667 14.6667">
            <path d={svgPaths.p3d62dd80} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[29.15%_37.83%_45.83%_37.87%]" data-name="Vector">
        <div className="absolute inset-[-16.65%_-17.15%_-16.66%_-17.16%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5.22018 5.3365">
            <path d={svgPaths.pb91f080} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
      <div className="absolute bottom-[29.17%] left-1/2 right-[49.96%] top-[70.83%]" data-name="Vector">
        <div className="absolute inset-[-0.67px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1.34 1.33333">
            <path d="M0.666667 0.666667H0.673334" id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Button69() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <HelpCircle34 />
      </div>
    </div>
  );
}

function Container187() {
  return (
    <div className="content-stretch flex h-[21.587px] items-center justify-between relative shrink-0 w-full" data-name="Container">
      <Container188 />
      <Button69 />
    </div>
  );
}

function Container189() {
  return (
    <div className="h-[18px] overflow-clip relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Consolas:Regular',sans-serif] leading-[18px] left-0 not-italic text-[#6a7282] text-[12px] top-[-0.4px]">bf:seriesStatement</p>
    </div>
  );
}

function Input27() {
  return (
    <div className="bg-[#f3f3f5] h-[36px] relative rounded-[14px] shrink-0 w-full" data-name="Input">
      <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex items-center px-[12px] py-[4px] relative size-full">
          <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#717182] text-[14px]">Enter series statement...</p>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[14px]" />
    </div>
  );
}

function Container186() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] h-[91.588px] items-start relative shrink-0 w-full" data-name="Container">
      <Container187 />
      <Container189 />
      <Input27 />
    </div>
  );
}

function Label41() {
  return (
    <div className="h-[20px] relative shrink-0 w-[121.013px]" data-name="Label">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center relative size-full">
        <p className="font-['Inter:Medium',sans-serif] font-medium leading-[20px] not-italic relative shrink-0 text-[#0a0a0a] text-[14px]">Illustrative Content</p>
      </div>
    </div>
  );
}

function Badge69() {
  return (
    <div className="h-[21.587px] relative rounded-[14px] shrink-0 w-[50.6px]" data-name="Badge">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center overflow-clip px-[8.8px] py-[2.8px] relative rounded-[inherit] size-full">
        <p className="font-['Consolas:Medium',sans-serif] leading-[16px] not-italic relative shrink-0 text-[#0a0a0a] text-[12px]">300$b</p>
      </div>
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[14px]" />
    </div>
  );
}

function Container192() {
  return (
    <div className="h-[21.587px] relative shrink-0 w-[179.613px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] items-center relative size-full">
        <Label41 />
        <Badge69 />
      </div>
    </div>
  );
}

function HelpCircle35() {
  return (
    <div className="h-[16px] overflow-clip relative shrink-0 w-full" data-name="HelpCircle">
      <div className="absolute inset-[8.33%]" data-name="Vector">
        <div className="absolute inset-[-5%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14.6667 14.6667">
            <path d={svgPaths.p3d62dd80} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[29.15%_37.83%_45.83%_37.87%]" data-name="Vector">
        <div className="absolute inset-[-16.65%_-17.15%_-16.66%_-17.16%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5.22018 5.3365">
            <path d={svgPaths.pb91f080} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
      <div className="absolute bottom-[29.17%] left-1/2 right-[49.96%] top-[70.83%]" data-name="Vector">
        <div className="absolute inset-[-0.67px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1.34 1.33333">
            <path d="M0.666667 0.666667H0.673334" id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Button70() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <HelpCircle35 />
      </div>
    </div>
  );
}

function Container191() {
  return (
    <div className="content-stretch flex h-[21.587px] items-center justify-between relative shrink-0 w-full" data-name="Container">
      <Container192 />
      <Button70 />
    </div>
  );
}

function Container193() {
  return (
    <div className="h-[18px] overflow-clip relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Consolas:Regular',sans-serif] leading-[18px] left-0 not-italic text-[#6a7282] text-[12px] top-[-0.4px]">bf:illustrativeContent</p>
    </div>
  );
}

function Input28() {
  return (
    <div className="bg-[#f3f3f5] h-[36px] relative rounded-[14px] shrink-0 w-full" data-name="Input">
      <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex items-center px-[12px] py-[4px] relative size-full">
          <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#717182] text-[14px]">Enter illustrative content...</p>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[14px]" />
    </div>
  );
}

function Container190() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] h-[91.588px] items-start relative shrink-0 w-full" data-name="Container">
      <Container191 />
      <Container193 />
      <Input28 />
    </div>
  );
}

function Label42() {
  return (
    <div className="h-[20px] relative shrink-0 w-[151.713px]" data-name="Label">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center relative size-full">
        <p className="font-['Inter:Medium',sans-serif] font-medium leading-[20px] not-italic relative shrink-0 text-[#0a0a0a] text-[14px]">Supplementary Content</p>
      </div>
    </div>
  );
}

function Badge70() {
  return (
    <div className="h-[21.587px] relative rounded-[14px] shrink-0 w-[37.4px]" data-name="Badge">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center overflow-clip px-[8.8px] py-[2.8px] relative rounded-[inherit] size-full">
        <p className="font-['Consolas:Medium',sans-serif] leading-[16px] not-italic relative shrink-0 text-[#0a0a0a] text-[12px]">504</p>
      </div>
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[14px]" />
    </div>
  );
}

function Container196() {
  return (
    <div className="h-[21.587px] relative shrink-0 w-[197.113px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] items-center relative size-full">
        <Label42 />
        <Badge70 />
      </div>
    </div>
  );
}

function HelpCircle36() {
  return (
    <div className="h-[16px] overflow-clip relative shrink-0 w-full" data-name="HelpCircle">
      <div className="absolute inset-[8.33%]" data-name="Vector">
        <div className="absolute inset-[-5%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14.6667 14.6667">
            <path d={svgPaths.p3d62dd80} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[29.15%_37.83%_45.83%_37.87%]" data-name="Vector">
        <div className="absolute inset-[-16.65%_-17.15%_-16.66%_-17.16%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5.22018 5.3365">
            <path d={svgPaths.pb91f080} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
      <div className="absolute bottom-[29.17%] left-1/2 right-[49.96%] top-[70.83%]" data-name="Vector">
        <div className="absolute inset-[-0.67px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1.34 1.33333">
            <path d="M0.666667 0.666667H0.673334" id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Button71() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <HelpCircle36 />
      </div>
    </div>
  );
}

function Container195() {
  return (
    <div className="content-stretch flex h-[21.587px] items-center justify-between relative shrink-0 w-full" data-name="Container">
      <Container196 />
      <Button71 />
    </div>
  );
}

function Container197() {
  return (
    <div className="h-[18px] overflow-clip relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Consolas:Regular',sans-serif] leading-[18px] left-0 not-italic text-[#6a7282] text-[12px] top-[-0.4px]">bf:supplementaryContent</p>
    </div>
  );
}

function Input29() {
  return (
    <div className="bg-[#f3f3f5] h-[36px] relative rounded-[14px] shrink-0 w-full" data-name="Input">
      <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex items-center px-[12px] py-[4px] relative size-full">
          <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#717182] text-[14px]">Enter supplementary content...</p>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[14px]" />
    </div>
  );
}

function Container194() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] h-[91.588px] items-start relative shrink-0 w-full" data-name="Container">
      <Container195 />
      <Container197 />
      <Input29 />
    </div>
  );
}

function Label43() {
  return (
    <div className="h-[20px] relative shrink-0 w-[111.65px]" data-name="Label">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center relative size-full">
        <p className="font-['Inter:Medium',sans-serif] font-medium leading-[20px] not-italic relative shrink-0 text-[#0a0a0a] text-[14px]">Mode of Issuance</p>
      </div>
    </div>
  );
}

function Badge71() {
  return (
    <div className="h-[21.587px] relative rounded-[14px] shrink-0 w-[76.988px]" data-name="Badge">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center overflow-clip px-[8.8px] py-[2.8px] relative rounded-[inherit] size-full">
        <p className="font-['Consolas:Medium',sans-serif] leading-[16px] not-italic relative shrink-0 text-[#0a0a0a] text-[12px]">Leader/07</p>
      </div>
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[14px]" />
    </div>
  );
}

function Container200() {
  return (
    <div className="h-[21.587px] relative shrink-0 w-[196.637px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] items-center relative size-full">
        <Label43 />
        <Badge71 />
      </div>
    </div>
  );
}

function HelpCircle37() {
  return (
    <div className="h-[16px] overflow-clip relative shrink-0 w-full" data-name="HelpCircle">
      <div className="absolute inset-[8.33%]" data-name="Vector">
        <div className="absolute inset-[-5%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14.6667 14.6667">
            <path d={svgPaths.p3d62dd80} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[29.15%_37.83%_45.83%_37.87%]" data-name="Vector">
        <div className="absolute inset-[-16.65%_-17.15%_-16.66%_-17.16%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5.22018 5.3365">
            <path d={svgPaths.pb91f080} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
      <div className="absolute bottom-[29.17%] left-1/2 right-[49.96%] top-[70.83%]" data-name="Vector">
        <div className="absolute inset-[-0.67px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1.34 1.33333">
            <path d="M0.666667 0.666667H0.673334" id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Button72() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <HelpCircle37 />
      </div>
    </div>
  );
}

function Container199() {
  return (
    <div className="content-stretch flex h-[21.587px] items-center justify-between relative shrink-0 w-full" data-name="Container">
      <Container200 />
      <Button72 />
    </div>
  );
}

function Container201() {
  return (
    <div className="h-[18px] overflow-clip relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Consolas:Regular',sans-serif] leading-[18px] left-0 not-italic text-[#6a7282] text-[12px] top-[-0.4px]">bf:issuance</p>
    </div>
  );
}

function Input30() {
  return (
    <div className="bg-[#f3f3f5] h-[36px] relative rounded-[14px] shrink-0 w-full" data-name="Input">
      <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex items-center px-[12px] py-[4px] relative size-full">
          <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#717182] text-[14px]">Enter mode of issuance...</p>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[14px]" />
    </div>
  );
}

function Container198() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] h-[91.588px] items-start relative shrink-0 w-full" data-name="Container">
      <Container199 />
      <Container201 />
      <Input30 />
    </div>
  );
}

function Label44() {
  return (
    <div className="h-[20px] relative shrink-0 w-[157.163px]" data-name="Label">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center relative size-full">
        <p className="font-['Inter:Medium',sans-serif] font-medium leading-[20px] not-italic relative shrink-0 text-[#0a0a0a] text-[14px]">Administrative Metadata</p>
      </div>
    </div>
  );
}

function Badge72() {
  return (
    <div className="h-[21.587px] relative rounded-[14px] shrink-0 w-[37.4px]" data-name="Badge">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center overflow-clip px-[8.8px] py-[2.8px] relative rounded-[inherit] size-full">
        <p className="font-['Consolas:Medium',sans-serif] leading-[16px] not-italic relative shrink-0 text-[#0a0a0a] text-[12px]">040</p>
      </div>
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[14px]" />
    </div>
  );
}

function Container204() {
  return (
    <div className="h-[21.587px] relative shrink-0 w-[202.563px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] items-center relative size-full">
        <Label44 />
        <Badge72 />
      </div>
    </div>
  );
}

function HelpCircle38() {
  return (
    <div className="h-[16px] overflow-clip relative shrink-0 w-full" data-name="HelpCircle">
      <div className="absolute inset-[8.33%]" data-name="Vector">
        <div className="absolute inset-[-5%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14.6667 14.6667">
            <path d={svgPaths.p3d62dd80} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[29.15%_37.83%_45.83%_37.87%]" data-name="Vector">
        <div className="absolute inset-[-16.65%_-17.15%_-16.66%_-17.16%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5.22018 5.3365">
            <path d={svgPaths.pb91f080} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
      <div className="absolute bottom-[29.17%] left-1/2 right-[49.96%] top-[70.83%]" data-name="Vector">
        <div className="absolute inset-[-0.67px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1.34 1.33333">
            <path d="M0.666667 0.666667H0.673334" id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Button73() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <HelpCircle38 />
      </div>
    </div>
  );
}

function Container203() {
  return (
    <div className="content-stretch flex h-[21.587px] items-center justify-between relative shrink-0 w-full" data-name="Container">
      <Container204 />
      <Button73 />
    </div>
  );
}

function Container205() {
  return (
    <div className="h-[18px] overflow-clip relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Consolas:Regular',sans-serif] leading-[18px] left-0 not-italic text-[#6a7282] text-[12px] top-[-0.4px]">bf:adminMetadata</p>
    </div>
  );
}

function Input31() {
  return (
    <div className="bg-[#f3f3f5] h-[36px] relative rounded-[14px] shrink-0 w-full" data-name="Input">
      <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex items-center px-[12px] py-[4px] relative size-full">
          <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#717182] text-[14px]">Enter administrative metadata...</p>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[14px]" />
    </div>
  );
}

function Container202() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] h-[91.588px] items-start relative shrink-0 w-full" data-name="Container">
      <Container203 />
      <Container205 />
      <Input31 />
    </div>
  );
}

function Container132() {
  return (
    <div className="h-[584.4px] relative shrink-0 w-full" data-name="Container">
      <div className="overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex flex-col gap-[16px] items-start pr-[8px] relative size-full">
          <Container133 />
          <Container140 />
          <Container146 />
          <Container150 />
          <Container154 />
          <Container162 />
          <Container166 />
          <Container170 />
          <Container174 />
          <Container178 />
          <Container182 />
          <Container186 />
          <Container190 />
          <Container194 />
          <Container198 />
          <Container202 />
        </div>
      </div>
    </div>
  );
}

function Container130() {
  return (
    <div className="bg-[rgba(255,255,255,0.75)] flex-[1_0_0] h-[678px] min-h-px min-w-px relative rounded-[20px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(255,255,255,0.3)] border-solid inset-0 pointer-events-none rounded-[20px] shadow-[0px_8px_32px_0px_rgba(31,38,135,0.15)]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[16px] items-start pb-[0.8px] pt-[24.8px] px-[24.8px] relative size-full">
        <Container131 />
        <Container132 />
      </div>
      <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.6)]" />
    </div>
  );
}

function Container9() {
  return (
    <div className="content-stretch flex gap-[24px] h-[678px] items-start relative shrink-0 w-full" data-name="Container">
      <Container10 />
      <Container130 />
    </div>
  );
}

function Container8() {
  return (
    <div className="absolute content-stretch flex flex-col h-[638.4px] items-start left-0 overflow-clip pl-[24px] pr-[32px] shadow-[0px_20px_60px_0px_rgba(0,0,0,0.6)] top-[296px] w-[1679.2px]" data-name="Container" style={{ backgroundImage: "linear-gradient(159.184deg, rgba(0, 0, 0, 0.4) 0%, rgba(20, 20, 30, 0.5) 100%)" }}>
      <Container9 />
      <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.1),inset_0px_-1px_0px_0px_rgba(0,0,0,0.5)]" />
    </div>
  );
}

function Div() {
  return (
    <div className="h-[934.4px] relative shrink-0 w-full" data-name="div" style={{ backgroundImage: "linear-gradient(150.906deg, rgb(102, 126, 234) 0%, rgb(118, 75, 162) 25%, rgb(240, 147, 251) 50%, rgb(79, 172, 254) 75%, rgb(0, 242, 254) 100%)" }}>
      <Section />
      <Container />
      <Container6 />
      <Container8 />
    </div>
  );
}

function Section1() {
  return <div className="h-0 shrink-0 w-full" data-name="Section" />;
}

function SM() {
  return (
    <div className="absolute bg-white content-stretch flex flex-col h-[934.4px] items-start left-0 top-0 w-[1679.2px]" data-name="sM">
      <Div />
      <Section1 />
    </div>
  );
}

function Book() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Book">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Book">
          <path d={svgPaths.p1e34ef00} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
        </g>
      </svg>
    </div>
  );
}

function Span2() {
  return (
    <div className="h-[24px] relative shrink-0 w-[94.588px]" data-name="span">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 absolute font-['Inter:Medium',sans-serif] font-medium leading-[24px] left-[47.5px] not-italic text-[16px] text-center text-white top-[-2.2px]">OPAC Viewer</p>
      </div>
    </div>
  );
}

function Button74() {
  return (
    <div className="absolute content-stretch flex gap-[8px] h-[45.6px] items-center left-[1483.01px] pl-[20.8px] pr-[0.8px] py-[0.8px] rounded-[12px] top-[856.8px] w-[164.188px]" data-name="button" style={{ backgroundImage: "linear-gradient(164.478deg, rgba(59, 130, 246, 0.9) 0%, rgba(139, 92, 246, 0.9) 100%)" }}>
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(255,255,255,0.5)] border-solid inset-0 pointer-events-none rounded-[12px] shadow-[0px_8px_32px_0px_rgba(0,0,0,0.4)]" />
      <Book />
      <Span2 />
      <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.2)]" />
    </div>
  );
}

function Languages() {
  return (
    <div className="absolute left-[20.8px] size-[16px] top-[14.8px]" data-name="Languages">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g clipPath="url(#clip0_524_4224)" id="Languages">
          <path d={svgPaths.p1a356800} id="Vector" stroke="var(--stroke-0, #364153)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p5fcf400} id="Vector_2" stroke="var(--stroke-0, #364153)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d="M1.33333 3.33333H9.33333" id="Vector_3" stroke="var(--stroke-0, #364153)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d="M4.66667 1.33333H5.33333" id="Vector_4" stroke="var(--stroke-0, #364153)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p1bfa36c0} id="Vector_5" stroke="var(--stroke-0, #364153)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d="M9.33333 12H13.3333" id="Vector_6" stroke="var(--stroke-0, #364153)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
        <defs>
          <clipPath id="clip0_524_4224">
            <rect fill="white" height="16" width="16" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Button75() {
  return (
    <div className="bg-[rgba(255,255,255,0.6)] h-[45.6px] relative rounded-[12px] shrink-0 w-[114.912px]" data-name="button">
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(255,255,255,0.5)] border-solid inset-0 pointer-events-none rounded-[12px] shadow-[0px_10px_15px_0px_rgba(0,0,0,0.1),0px_4px_6px_0px_rgba(0,0,0,0.1)]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Languages />
        <p className="-translate-x-1/2 absolute font-['Inter:Medium','Noto_Sans_Arabic:Medium',sans-serif] font-medium leading-[24px] left-[49.3px] not-italic text-[#364153] text-[16px] text-center top-[8.6px]" dir="auto">
          ع
        </p>
      </div>
    </div>
  );
}

function Palette() {
  return (
    <div className="absolute left-[20.8px] size-[16px] top-[14.8px]" data-name="Palette">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g clipPath="url(#clip0_524_4146)" id="Palette">
          <path d={svgPaths.p13a75f00} fill="var(--fill-0, #364153)" id="Vector" stroke="var(--stroke-0, #364153)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p3359640} fill="var(--fill-0, #364153)" id="Vector_2" stroke="var(--stroke-0, #364153)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p2041a800} fill="var(--fill-0, #364153)" id="Vector_3" stroke="var(--stroke-0, #364153)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p1e291080} fill="var(--fill-0, #364153)" id="Vector_4" stroke="var(--stroke-0, #364153)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p120b5900} id="Vector_5" stroke="var(--stroke-0, #364153)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
        <defs>
          <clipPath id="clip0_524_4146">
            <rect fill="white" height="16" width="16" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Button76() {
  return (
    <div className="bg-[rgba(255,255,255,0.6)] h-[45.6px] relative rounded-[12px] shrink-0 w-[114.912px]" data-name="button">
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(255,255,255,0.5)] border-solid inset-0 pointer-events-none rounded-[12px] shadow-[0px_10px_15px_0px_rgba(0,0,0,0.1),0px_4px_6px_0px_rgba(0,0,0,0.1)]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Palette />
        <p className="-translate-x-1/2 absolute font-['Inter:Medium',sans-serif] font-medium leading-[24px] left-[70.3px] not-italic text-[#364153] text-[16px] text-center top-[8.6px]">Theme</p>
      </div>
    </div>
  );
}

function Div1() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[8px] h-[99.2px] items-start left-[1540.29px] top-[80px] w-[114.912px]" data-name="div">
      <Button75 />
      <Button76 />
    </div>
  );
}

export default function MoonEditor() {
  return (
    <div className="bg-white relative size-full" data-name="moon editor">
      <SM />
      <Button74 />
      <Div1 />
    </div>
  );
}