import * as React from 'react';
import Svg, { Circle, Line, Rect, Path } from 'react-native-svg';
import { SvgXml } from 'react-native-svg';

export const AddToClubsIconSVG = () => {
    const xmlString = `
        <svg width="24" height="26" viewBox="0 0 24 26" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M13 12.7354C13 12.1831 12.5523 11.7354 12 11.7354C11.4477 11.7354 11 12.1831 11 12.7354V15.4861H8.25C7.69772 15.4861 7.25 15.9338 7.25 16.4861C7.25 17.0384 7.69772 17.4861 8.25 17.4861H11V20.2373C11 20.7896 11.4477 21.2373 12 21.2373C12.5523 21.2373 13 20.7896 13 20.2373V17.4861H15.7484C16.3007 17.4861 16.7484 17.0384 16.7484 16.4861C16.7484 15.9338 16.3007 15.4861 15.7484 15.4861H13V12.7354ZM7.06583 0.444539C6.48292 -0.144105 5.53318 -0.148749 4.94454 0.434166C4.3559 1.01708 4.35125 1.96682 4.93417 2.55546L9.6547 7.32239H2.4C1.07452 7.32239 0 8.40746 0 9.74597V23.0757C0 24.4142 1.07452 25.4993 2.4 25.4993H21.6C22.9255 25.4993 24 24.4142 24 23.0757V9.74597C24 8.40746 22.9255 7.32239 21.6 7.32239H14.3453L19.0658 2.55546C19.6488 1.96682 19.6441 1.01708 19.0555 0.434166C18.4668 -0.148749 17.5171 -0.144105 16.9342 0.444539L12 5.4272L7.06583 0.444539Z" fill="white"/>
        </svg>
    `
    return <SvgXml xml={xmlString} />;
}

export const AddedToClubsIconSVG = () => {
    const xmlString = `
        <svg width="24" height="26" viewBox="0 0 24 26" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M4.94454 0.434166C5.53318 -0.148749 6.48292 -0.144105 7.06583 0.444539L12 5.4272L16.9342 0.444539C17.5171 -0.144105 18.4668 -0.148749 19.0555 0.434166C19.6441 1.01708 19.6488 1.96682 19.0658 2.55546L14.3453 7.32239H21.6C22.9255 7.32239 24 8.40746 24 9.74597V23.0757C24 24.4142 22.9255 25.4993 21.6 25.4993H2.4C1.07452 25.4993 0 24.4142 0 23.0757V9.74597C0 8.40746 1.07452 7.32239 2.4 7.32239H9.6547L4.93417 2.55546C4.35125 1.96682 4.3559 1.01708 4.94454 0.434166ZM17.2354 12.4228C16.828 12.0564 16.2016 12.0863 15.8309 12.4897L10.504 18.2876L8.16725 15.8364C7.79564 15.4466 7.18141 15.423 6.78095 15.7831C6.35656 16.1647 6.33923 16.8243 6.74298 17.2277L9.77926 20.2612C10.1767 20.6583 10.8231 20.6502 11.2104 20.2433L17.291 13.8552C17.6793 13.4473 17.6541 12.7993 17.2354 12.4228Z" fill="white"/>
        </svg>
    `
    return <SvgXml xml={xmlString} />;
}

export const AddToWatchlistIconSVG = () => {
    return (
        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <Path d="M14 11C14 10.4477 13.5523 10 13 10H3C2.44772 10 2 10.4477 2 11V11C2 11.5523 2.44772 12 3 12H13C13.5523 12 14 11.5523 14 11V11ZM14 7C14 6.44772 13.5523 6 13 6H3C2.44772 6 2 6.44772 2 7V7C2 7.55228 2.44772 8 3 8H13C13.5523 8 14 7.55228 14 7V7ZM18 14V11C18 10.4477 17.5523 10 17 10V10C16.4477 10 16 10.4477 16 11V14H13C12.4477 14 12 14.4477 12 15V15C12 15.5523 12.4477 16 13 16H16V19C16 19.5523 16.4477 20 17 20V20C17.5523 20 18 19.5523 18 19V16H21C21.5523 16 22 15.5523 22 15V15C22 14.4477 21.5523 14 21 14H18ZM2 15C2 15.5523 2.44772 16 3 16H9C9.55228 16 10 15.5523 10 15V15C10 14.4477 9.55228 14 9 14H3C2.44772 14 2 14.4477 2 15V15Z" fill="white"/>
        </Svg>
    );
}

export const AddedToWatchlistGiantIconSVG = () => {
    const xmlString = `
    <svg width="87" height="92" viewBox="0 0 87 92" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g filter="url(#filter0_d_1800_121566)">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M21.985 1.43268C23.5548 -0.121761 26.0874 -0.109378 27.6418 1.46034L45.4996 19.4936L63.3574 1.46034C64.9118 -0.109378 67.4445 -0.121761 69.0142 1.43268C70.5839 2.98712 70.5963 5.51975 69.0418 7.08947L51.9377 24.3617H78.6196C83.1925 24.3617 86.8996 28.1052 86.8996 32.7231V78.7106C86.8996 83.3285 83.1925 87.072 78.6196 87.072H12.3796C7.80669 87.072 4.09961 83.3285 4.09961 78.7106V32.7231C4.09961 28.1052 7.80669 24.3617 12.3796 24.3617H39.0616L21.9574 7.08947C20.4029 5.51975 20.4153 2.98712 21.985 1.43268ZM63.932 42.3316C62.7453 41.2854 60.9402 41.3791 59.8682 42.5425L40.3385 63.7369L31.1253 54.1038C30.0509 52.9804 28.2813 52.905 27.1153 53.933C25.8608 55.0389 25.8004 56.9742 26.9834 58.1562L36.7147 67.8788C38.7017 69.8641 41.9337 69.8235 43.8703 67.789L64.1154 46.5202C65.2534 45.3247 65.1701 43.423 63.932 42.3316Z" fill="white"/>
        </g>
        <defs>
            <filter id="filter0_d_1800_121566" x="0.0996094" y="0.274902" width="86.8008" height="90.7971" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                <feFlood flood-opacity="0" result="BackgroundImageFix"/>
                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                <feOffset dx="-2" dy="2"/>
                <feGaussianBlur stdDeviation="1"/>
                <feComposite in2="hardAlpha" operator="out"/>
                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.5 0"/>
                <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1800_121566"/>
                <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_1800_121566" result="shape"/>
            </filter>
        </defs>
    </svg>
    `
    return <SvgXml xml={xmlString} />;
}

export const ChatsIconSVG = () => {
    const xmlString = `
        <svg width="60" height="48" viewBox="0 0 60 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13.5 15C9.35625 15 6 11.6438 6 7.5C6 3.35625 9.35625 0 13.5 0C17.6437 0 21 3.35625 21 7.5C21 11.6438 17.6437 15 13.5 15ZM48 15C43.8563 15 40.5 11.6438 40.5 7.5C40.5 3.35625 43.8563 0 48 0C52.1437 0 55.5 3.35625 55.5 7.5C55.5 11.6438 52.1437 15 48 15ZM0 28.0031C0 22.4813 4.48125 18 10.0031 18H14.0062C15.4969 18 16.9125 18.3281 18.1875 18.9094C18.0656 19.5844 18.0094 20.2875 18.0094 21C18.0094 24.5812 19.5844 27.7969 22.0687 30C22.05 30 22.0312 30 22.0031 30H1.99687C0.9 30 0 29.1 0 28.0031ZM37.9969 30C37.9781 30 37.9594 30 37.9313 30C40.425 27.7969 41.9906 24.5812 41.9906 21C41.9906 20.2875 41.925 19.5938 41.8125 18.9094C43.0875 18.3188 44.5031 18 45.9938 18H49.9969C55.5187 18 60 22.4813 60 28.0031C60 29.1094 59.1 30 58.0031 30H37.9969ZM39 21C39 25.9688 34.9688 30 30 30C25.0312 30 21 25.9688 21 21C21 16.0312 25.0312 12 30 12C34.9688 12 39 16.0312 39 21ZM12 45.4969C12 38.5969 17.5969 33 24.4969 33H35.5031C42.4031 33 48 38.5969 48 45.4969C48 46.875 46.8844 48 45.4969 48H14.5031C13.125 48 12 46.8844 12 45.4969Z" fill="white"/>
        </svg>
    `
    return <SvgXml xml={xmlString} />;
}

export const ChatsTabIconSVG = () => {
    const xmlString = `
        <svg width="30" height="24" viewBox="0 0 30 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6.75 7.5C4.67812 7.5 3 5.82188 3 3.75C3 1.67812 4.67812 0 6.75 0C8.82188 0 10.5 1.67812 10.5 3.75C10.5 5.82188 8.82188 7.5 6.75 7.5ZM24 7.5C21.9281 7.5 20.25 5.82188 20.25 3.75C20.25 1.67812 21.9281 0 24 0C26.0719 0 27.75 1.67812 27.75 3.75C27.75 5.82188 26.0719 7.5 24 7.5ZM0 14.0016C0 11.2406 2.24062 9 5.00156 9H7.00312C7.74844 9 8.45625 9.16406 9.09375 9.45469C9.03281 9.79219 9.00469 10.1438 9.00469 10.5C9.00469 12.2906 9.79219 13.8984 11.0344 15C11.025 15 11.0156 15 11.0016 15H0.998437C0.45 15 0 14.55 0 14.0016ZM18.9984 15C18.9891 15 18.9797 15 18.9656 15C20.2125 13.8984 20.9953 12.2906 20.9953 10.5C20.9953 10.1438 20.9625 9.79687 20.9062 9.45469C21.5438 9.15937 22.2516 9 22.9969 9H24.9984C27.7594 9 30 11.2406 30 14.0016C30 14.5547 29.55 15 29.0016 15H18.9984ZM19.5 10.5C19.5 12.9844 17.4844 15 15 15C12.5156 15 10.5 12.9844 10.5 10.5C10.5 8.01562 12.5156 6 15 6C17.4844 6 19.5 8.01562 19.5 10.5ZM6 22.7484C6 19.2984 8.79844 16.5 12.2484 16.5H17.7516C21.2016 16.5 24 19.2984 24 22.7484C24 23.4375 23.4422 24 22.7484 24H7.25156C6.5625 24 6 23.4422 6 22.7484V22.7484Z" fill="white"/>
        </svg>    
    `
    return <SvgXml xml={xmlString} />;
}

export const ClubsIconSolidSVG = () => {
    const xmlString = `
        <svg width="24" height="26" viewBox="0 0 24 26" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M7.06583 0.444539C6.48292 -0.144105 5.53318 -0.148749 4.94454 0.434166C4.3559 1.01708 4.35125 1.96682 4.93417 2.55546L9.6547 7.32239H2.4C1.07452 7.32239 0 8.40746 0 9.74597V23.0757C0 24.4142 1.07452 25.4993 2.4 25.4993H21.6C22.9255 25.4993 24 24.4142 24 23.0757V9.74597C24 8.40746 22.9255 7.32239 21.6 7.32239H14.3453L19.0658 2.55546C19.6488 1.96682 19.6441 1.01708 19.0555 0.434166C18.4668 -0.148749 17.5171 -0.144105 16.9342 0.444539L12 5.4272L7.06583 0.444539Z" fill="white"/>
        </svg>
    `
    return <SvgXml xml={xmlString} />;
}

export const ClubsIconSVG = ({ enlarge=false, sizeRatio=0.1 }) => {
    const size = sizeRatio * 100;
    const xmlString = `
        <svg width="24" height="26" viewBox="0 0 24 26" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M7.06583 0.444539C6.48292 -0.144105 5.53318 -0.148749 4.94454 0.434166C4.3559 1.01708 4.35125 1.96682 4.93417 2.55546L9.6547 7.32239H2.4C1.07452 7.32239 0 8.40746 0 9.74597V23.0757C0 24.4142 1.07452 25.4993 2.4 25.4993H21.6C22.9255 25.4993 24 24.4142 24 23.0757V9.74597C24 8.40746 22.9255 7.32239 21.6 7.32239H14.3453L19.0658 2.55546C19.6488 1.96682 19.6441 1.01708 19.0555 0.434166C18.4668 -0.148749 17.5171 -0.144105 16.9342 0.444539L12 5.4272L7.06583 0.444539ZM3 22.4993V10.3224H21V22.4993H3Z" fill="white"/>
        </svg>
    `
    if (enlarge) return <SvgXml xml={xmlString} height={`${size}%`} width={`${size}%`} />;
    return <SvgXml xml={xmlString} />;
}

export const CommentIconSVG = ({ color='white' }) => {
    const xmlString = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M20.9411 16.4706C21.6412 15.0846 22.004 13.5528 22 12V11.4118C21.8647 8.9596 20.8297 6.6435 19.0931 4.90692C17.3565 3.17034 15.0404 2.13532 12.5882 2.00003H12C10.4472 1.99598 8.91544 2.35877 7.52943 3.05885C5.86855 3.88893 4.47159 5.16502 3.49499 6.74419C2.5184 8.32337 2.00075 10.1433 2.00003 12C1.99598 13.5528 2.35877 15.0846 3.05885 16.4706L2.00003 22L7.52943 20.9411C8.91544 21.6412 10.4472 22.004 12 22C13.8567 21.9992 15.6766 21.4816 17.2558 20.505C18.835 19.5284 20.1111 18.1314 20.9411 16.4706ZM6.66667 14.8333C8.13943 14.8333 9.33334 13.6394 9.33334 12.1667C9.33333 13.6394 10.5272 14.8333 12 14.8333C13.4718 14.8333 14.6652 13.6409 14.6667 12.1695C14.6682 13.6409 15.8615 14.8333 17.3333 14.8333C18.8061 14.8333 20 13.6394 20 12.1667C20 10.6939 18.8061 9.5 17.3333 9.5C15.8615 9.5 14.6682 10.6924 14.6667 12.1639C14.6652 10.6924 13.4718 9.5 12 9.5C10.5278 9.5 9.33416 10.6931 9.33333 12.1651C9.33251 10.6931 8.13892 9.5 6.66667 9.5C5.19391 9.5 4 10.6939 4 12.1667C4 13.6394 5.19391 14.8333 6.66667 14.8333Z" fill="${color}"/>
            <path d="M22 12L21 12L21 12.0026L22 12ZM20.9411 16.4706L20.0485 16.0197L20.0466 16.0235L20.9411 16.4706ZM22 11.4118H23C23 11.3934 22.9995 11.375 22.9984 11.3567L22 11.4118ZM19.0931 4.90692L19.8002 4.19981L19.8002 4.19981L19.0931 4.90692ZM12.5882 2.00003L12.6433 1.00155C12.625 1.00054 12.6066 1.00003 12.5882 1.00003V2.00003ZM12 2.00003L11.9974 3.00003H12V2.00003ZM7.52943 3.05885L7.97649 3.95337L7.98028 3.95145L7.52943 3.05885ZM3.49499 6.74419L4.3455 7.27016L4.3455 7.27016L3.49499 6.74419ZM2.00003 12L3.00003 12.0026L3.00003 12.0004L2.00003 12ZM3.05885 16.4706L4.04101 16.6586C4.08257 16.4416 4.05107 16.217 3.95145 16.0197L3.05885 16.4706ZM2.00003 22L1.01788 21.8119C0.955543 22.1374 1.05856 22.4727 1.29293 22.7071C1.5273 22.9414 1.86257 23.0445 2.18811 22.9821L2.00003 22ZM7.52943 20.9411L7.98028 20.0485C7.78305 19.9489 7.55837 19.9174 7.34135 19.959L7.52943 20.9411ZM12 22L11.9996 21L11.9974 21L12 22ZM10.3333 12.1667C10.3333 11.6144 9.88562 11.1667 9.33334 11.1667C8.78105 11.1667 8.33334 11.6144 8.33334 12.1667H10.3333ZM14.6667 12.1695L15.6667 12.1684C15.6661 11.6166 15.2186 11.1695 14.6667 11.1695C14.1148 11.1695 13.6672 11.6166 13.6667 12.1684L14.6667 12.1695ZM14.6667 12.1639L13.6667 12.1649C13.6672 12.7168 14.1148 13.1639 14.6667 13.1639C15.2186 13.1639 15.6661 12.7168 15.6667 12.1649L14.6667 12.1639ZM9.33333 12.1651L8.33334 12.1657C8.33365 12.7178 8.78127 13.1651 9.33334 13.1651C9.8854 13.1651 10.333 12.7178 10.3333 12.1657L9.33333 12.1651ZM21 12.0026C21.0036 13.3979 20.6776 14.7743 20.0485 16.0197L21.8337 16.9214C22.6048 15.3948 23.0044 13.7077 23 11.9974L21 12.0026ZM21 11.4118V12H23V11.4118H21ZM18.386 5.61402C19.9485 7.17654 20.8798 9.26048 21.0015 11.4669L22.9984 11.3567C22.8496 8.65872 21.7108 6.11046 19.8002 4.19981L18.386 5.61402ZM12.5331 2.99852C14.7395 3.12024 16.8235 4.05151 18.386 5.61402L19.8002 4.19981C17.8895 2.28916 15.3413 1.1504 12.6433 1.00155L12.5331 2.99852ZM12 3.00003H12.5882V1.00003H12V3.00003ZM7.98028 3.95145C9.22571 3.32238 10.6021 2.99639 11.9974 3.00003L12.0026 1.00004C10.2923 0.995578 8.60517 1.39517 7.07857 2.16626L7.98028 3.95145ZM4.3455 7.27016C5.22443 5.84891 6.4817 4.70043 7.97648 3.95336L7.08237 2.16435C5.25541 3.07743 3.71874 4.48113 2.64449 6.21822L4.3455 7.27016ZM3.00003 12.0004C3.00068 10.3293 3.46656 8.69142 4.3455 7.27016L2.64449 6.21822C1.57024 7.95531 1.00082 9.95719 1.00003 11.9996L3.00003 12.0004ZM3.95145 16.0197C3.32238 14.7743 2.99639 13.3979 3.00003 12.0026L1.00004 11.9974C0.995578 13.7077 1.39517 15.3948 2.16626 16.9214L3.95145 16.0197ZM2.98219 22.188L4.04101 16.6586L2.0767 16.2825L1.01788 21.8119L2.98219 22.188ZM7.34135 19.959L1.81196 21.0178L2.18811 22.9821L7.7175 21.9233L7.34135 19.959ZM11.9974 21C10.6021 21.0036 9.22571 20.6776 7.98028 20.0485L7.07857 21.8337C8.60517 22.6048 10.2923 23.0044 12.0026 23L11.9974 21ZM16.7298 19.6545C15.3086 20.5334 13.6707 20.9993 11.9996 21L12.0004 23C14.0428 22.9992 16.0447 22.4298 17.7818 21.3555L16.7298 19.6545ZM20.0466 16.0235C19.2996 17.5183 18.1511 18.7756 16.7298 19.6545L17.7818 21.3555C19.5189 20.2813 20.9226 18.7446 21.8356 16.9176L20.0466 16.0235ZM8.33334 12.1667C8.33334 13.0871 7.58714 13.8333 6.66667 13.8333V15.8333C8.69171 15.8333 10.3333 14.1917 10.3333 12.1667H8.33334ZM12 13.8333C11.0795 13.8333 10.3333 13.0871 10.3333 12.1667L8.33334 12.1667C8.33333 14.1917 9.97496 15.8333 12 15.8333V13.8333ZM13.6667 12.1684C13.6657 13.0881 12.9199 13.8333 12 13.8333V15.8333C14.0238 15.8333 15.6646 14.1938 15.6667 12.1705L13.6667 12.1684ZM17.3333 13.8333C16.4134 13.8333 15.6676 13.0881 15.6667 12.1684L13.6667 12.1705C13.6687 14.1938 15.3096 15.8333 17.3333 15.8333V13.8333ZM19 12.1667C19 13.0871 18.2538 13.8333 17.3333 13.8333V15.8333C19.3584 15.8333 21 14.1917 21 12.1667H19ZM17.3333 10.5C18.2538 10.5 19 11.2462 19 12.1667H21C21 10.1416 19.3584 8.5 17.3333 8.5V10.5ZM15.6667 12.1649C15.6676 11.2453 16.4134 10.5 17.3333 10.5V8.5C15.3096 8.5 13.6687 10.1395 13.6667 12.1629L15.6667 12.1649ZM12 10.5C12.9199 10.5 13.6657 11.2453 13.6667 12.1649L15.6667 12.1629C15.6646 10.1395 14.0238 8.5 12 8.5V10.5ZM10.3333 12.1657C10.3339 11.2457 11.0798 10.5 12 10.5V8.5C9.97566 8.5 8.33447 10.1405 8.33334 12.1646L10.3333 12.1657ZM6.66667 10.5C7.58682 10.5 8.33282 11.2457 8.33334 12.1657L10.3333 12.1646C10.3322 10.1405 8.69101 8.5 6.66667 8.5V10.5ZM5 12.1667C5 11.2462 5.74619 10.5 6.66667 10.5V8.5C4.64162 8.5 3 10.1416 3 12.1667H5ZM6.66667 13.8333C5.74619 13.8333 5 13.0871 5 12.1667H3C3 14.1917 4.64162 15.8333 6.66667 15.8333V13.8333Z" fill="${color}"/>
        </svg>
    `
    return <SvgXml xml={xmlString} />
}

export const FiltersSVG = () => {
    const xmlString = `
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clip-path="url(#clip0_1798_119748)">
                <path d="M18.6502 17.8H12.7002" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M9.29961 17.8H3.34961" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M18.65 11H11" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M7.59961 11H3.34961" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M18.6494 4.19995H14.3994" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M10.9996 4.19995L3.34961 4.19995" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M12.7002 20.3499V15.2499" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M7.59961 13.55V8.45005" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M14.3994 6.75V1.65" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </g>
            <defs>
                <clipPath id="clip0_1798_119748">
                    <rect width="20.4" height="20.4" fill="white" transform="translate(0.799805 21.2) rotate(-90)"/>
                </clipPath>
            </defs>
        </svg>        
    `
    return <SvgXml xml={xmlString} />
}

export const HelpingHandsSVG = () => {
    return (
        <Svg width={24} height={24} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <Path d="M328.7 52.28L431.7 119.8C449.5 132.9 453.3 157.9 440.2 175.7C427.1 193.5 402.1 197.3 384.3 184.2L296.6 127.1H191.1C183.2 127.1 175.1 135.2 175.1 143.1C175.1 152.7 183.2 159.1 191.1 159.1H254.2C270.2 159.1 284.1 170.9 287.6 186.6C290.8 206.6 275.5 223.1 255.1 223.1H143.1C116.1 223.1 90.87 214.7 69.87 197.7L23.37 159.1L15.1 160C7.25 160 0 152.7 0 143.1V47.99C0 39.25 7.25 32 15.1 32H266.1C289 32 310.9 39.19 328.7 52.28L328.7 52.28zM151.3 459.7L16.27 360.2C-1.509 347.1-5.305 322.1 7.803 304.3C20.93 286.5 45.94 282.7 63.74 295.8L183.4 384H304C312.8 384 320 376.8 320 368C320 359.3 312.8 352 304 352H225.8C209.8 352 195 341.1 192.4 325.4C189.2 305.4 204.5 288 224 288H352C379 288 405.1 297.3 426.1 314.3L472.6 352L496 352C504.7 352 512 359.3 512 368V464C512 472.8 504.7 480 496 480H213C190.1 480 169.1 472.8 151.3 459.7V459.7z"/>
        </Svg>
    );
}

export const NotificationIconSVG = () => {
    const xmlString = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13.73 21C13.5542 21.3031 13.3018 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21M22 17H2C2.79565 17 3.55871 16.6839 4.12132 16.1213C4.68393 15.5587 5 14.7956 5 14V9C5 7.14348 5.7375 5.36301 7.05025 4.05025C8.36301 2.7375 10.1435 2 12 2C13.8565 2 15.637 2.7375 16.9497 4.05025C18.2625 5.36301 19 7.14348 19 9V14C19 14.7956 19.3161 15.5587 19.8787 16.1213C20.4413 16.6839 21.2044 17 22 17V17Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>    
    `
    return <SvgXml xml={xmlString} />;
}

export const ReviewIconSVG = () => {
    const xmlString = `
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M30.9 16.5H45.75C46.7156 16.5 47.5688 17.1094 47.8781 18.0187C48.1875 18.9281 47.8875 19.9312 47.1281 20.5219L34.8656 30.0656L39.6469 45.0656C39.9469 46.0031 39.6 47.0344 38.7844 47.5969C37.9781 48.1594 36.9 48.1312 36.1219 47.5219L24 38.1L11.8781 47.5219C11.1 48.1312 10.0219 48.1594 9.21283 47.5969C8.4047 47.0344 8.05689 46.0031 8.35595 45.0656L13.1344 30.0656L0.868797 20.5219C0.110078 19.9312 -0.190016 18.9281 0.12189 18.0187C0.43389 17.1094 1.28908 16.5 2.25002 16.5H17.1094L21.8531 1.5675C22.1531 0.634125 23.025 0 24 0C24.9844 0 25.8469 0.634125 26.1469 1.5675L30.9 16.5ZM24 33C24.4875 33 24.975 33.1594 25.3781 33.4781L33.1594 39.525L30.1031 29.9344C29.8219 29.0344 30.1219 28.05 30.8719 27.4781L39.1969 20.9156H29.25C28.2656 20.9156 27.4031 20.3625 27.1031 19.4344L24 9.675V33Z" fill="white"/>
        </svg>    
    `
    return <SvgXml xml={xmlString} />;
}

export const ReviewIconSmallSVG = () => {
    const xmlString = `
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20.6006 11.0001H30.501C31.1447 11.0001 31.7135 11.4063 31.9197 12.0126C32.126 12.6188 31.926 13.2876 31.4197 13.6813L23.2445 20.0439L26.4321 30.044C26.6321 30.669 26.4008 31.3565 25.8571 31.7315C25.3195 32.1065 24.6008 32.0877 24.082 31.6815L16.0005 25.4002L7.919 31.6815C7.40024 32.0877 6.68147 32.1065 6.14207 31.7315C5.60331 31.3565 5.37143 30.669 5.57081 30.044L8.75653 20.0439L0.579216 13.6813C0.0733875 13.2876 -0.126681 12.6188 0.0812627 12.0126C0.289269 11.4063 0.859412 11.0001 1.50006 11.0001H11.4066L14.5692 1.04501C14.7692 0.422753 15.3505 0 16.0005 0C16.6568 0 17.2318 0.422753 17.4318 1.04501L20.6006 11.0001ZM16.0005 22.0001C16.3255 22.0001 16.6505 22.1064 16.9193 22.3189L22.1069 26.3502L20.0694 19.9564C19.8819 19.3564 20.0819 18.7001 20.5819 18.3189L26.1321 13.9438H19.5006C18.8443 13.9438 18.2693 13.5751 18.0693 12.9563L16.0005 6.45004V22.0001Z" fill="white"/>
        </svg>
    `
    return <SvgXml xml={xmlString} />
}

export const SearchIconSVG = () => {
    const xmlString = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M21 21.0004L16.65 16.6504" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>    
    `
    return <SvgXml xml={xmlString} />;
}

export const ShareOutSVG = () => {
    const xmlString = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 15V19C3 20.1 3.9 21 5 21H19C19.5304 21 20.0391 20.7893 20.4142 20.4142C20.7893 20.0391 21 19.5304 21 19V15M17 8L12 3L7 8M12 4.2V14.5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
    `
    return <SvgXml xml={xmlString} />;
}

export const StainedGlassSVG = () => {
    return (
        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <Path d="M0 2.66667V21.3333C0 22.8 1.18667 24 2.66667 24H10.6667V0H2.66667C1.18667 0 0 1.2 0 2.66667ZM21.3333 0H13.3333V10.6667H24V2.66667C24 1.2 22.8 0 21.3333 0ZM13.3333 24H21.3333C22.8 24 24 22.8 24 21.3333V13.3333H13.3333V24Z" fill="#2977ef"/>
        </Svg>
    );
}

export const TopicsIconSVG = () => {
    const xmlString = `
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M35.1375 7.52813C33.3656 3.1125 29.0438 0 24 0C18.9562 0 14.6344 3.1125 12.8625 7.52813C12.5812 7.50938 12.2906 7.5 12 7.5C5.37188 7.5 0 12.8719 0 19.5C0 26.1281 5.37188 31.5 12 31.5C13.35 31.5 14.6531 31.275 15.8719 30.8625C17.3156 33.9 20.4094 36 24 36C27.5906 36 30.6844 33.9 32.1281 30.8625C33.3375 31.275 34.6406 31.5 36 31.5C42.6281 31.5 48 26.1281 48 19.5C48 12.8719 42.6281 7.5 36 7.5C35.7094 7.5 35.4281 7.50938 35.1375 7.52813ZM13.5 45C15.9844 45 18 42.9844 18 40.5C18 38.0156 15.9844 36 13.5 36C11.0156 36 9 38.0156 9 40.5C9 42.9844 11.0156 45 13.5 45ZM3 48C4.65938 48 6 46.6594 6 45C6 43.3406 4.65938 42 3 42C1.34062 42 0 43.3406 0 45C0 46.6594 1.34062 48 3 48Z" fill="white"/>
        </svg>    
    `
    return <SvgXml xml={xmlString} />;
}

export const TopicsCardIconSmallSVG = () => {
    const xmlString = `
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M23.425 5.01875C22.2437 2.075 19.3625 0 16 0C12.6375 0 9.75625 2.075 8.575 5.01875C8.3875 5.00625 8.19375 5 8 5C3.58125 5 0 8.58125 0 13C0 17.4188 3.58125 21 8 21C8.9 21 9.76875 20.85 10.5813 20.575C11.5438 22.6 13.6063 24 16 24C18.3938 24 20.4563 22.6 21.4188 20.575C22.225 20.85 23.0938 21 24 21C28.4188 21 32 17.4188 32 13C32 8.58125 28.4188 5 24 5C23.8063 5 23.6187 5.00625 23.425 5.01875ZM23.425 30C25.0812 30 26.3333 28.6563 26.3333 27C26.3333 25.3438 25.0812 24 23.425 24C21.7687 24 20.3333 25.3438 20.3333 27C20.3333 28.6563 21.7687 30 23.425 30ZM30 32C31.1063 32 32 31.1063 32 30C32 28.8938 31.1063 28 30 28C28.8938 28 28 28.8938 28 30C28 31.1063 28.8938 32 30 32Z" fill="white"/>
        </svg>
    `
    return <SvgXml xml={xmlString} />;
}

export const TopicsBannerIconSVG = () => {
    const xmlString = `
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M29.2812 6.27344C27.8047 2.59375 24.2031 0 20 0C15.7969 0 12.1953 2.59375 10.7187 6.27344C10.4844 6.25781 10.2422 6.25 10 6.25C4.47656 6.25 0 10.7266 0 16.25C0 21.7734 4.47656 26.25 10 26.25C11.125 26.25 12.2109 26.0625 13.2266 25.7188C14.4297 28.25 17.0078 30 20 30C22.9922 30 25.5703 28.25 26.7734 25.7188C27.7813 26.0625 28.8672 26.25 30 26.25C35.5234 26.25 40 21.7734 40 16.25C40 10.7266 35.5234 6.25 30 6.25C29.7578 6.25 29.5234 6.25781 29.2812 6.27344ZM29.2812 37.5C31.3516 37.5 32.9167 35.8203 32.9167 33.75C32.9167 31.6797 31.3516 30 29.2812 30C27.2109 30 25.4167 31.6797 25.4167 33.75C25.4167 35.8203 27.2109 37.5 29.2812 37.5ZM37.5 40C38.8828 40 40 38.8828 40 37.5C40 36.1172 38.8828 35 37.5 35C36.1172 35 35 36.1172 35 37.5C35 38.8828 36.1172 40 37.5 40Z" fill="white"/>
        </svg>
    `
    return <SvgXml xml={xmlString} />;
}

export const TopicsGiantIconSVG = () => {
    const xmlString = `
        <svg width="160" height="160" viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M117.125 25.0938C111.219 10.375 96.8125 0 80 0C63.1875 0 48.7812 10.375 42.875 25.0938C41.9375 25.0313 40.9687 25 40 25C17.9063 25 0 42.9062 0 65C0 87.0937 17.9063 105 40 105C44.5 105 48.8438 104.25 52.9063 102.875C57.7188 113 68.0312 120 80 120C91.9687 120 102.281 113 107.094 102.875C111.125 104.25 115.469 105 120 105C142.094 105 160 87.0937 160 65C160 42.9062 142.094 25 120 25C119.031 25 118.094 25.0313 117.125 25.0938ZM45 150C53.2812 150 60 143.281 60 135C60 126.719 53.2812 120 45 120C36.7187 120 30 126.719 30 135C30 143.281 36.7187 150 45 150ZM10 160C15.5312 160 20 155.531 20 150C20 144.469 15.5312 140 10 140C4.46875 140 0 144.469 0 150C0 155.531 4.46875 160 10 160Z" fill="white"/>
        </svg>
    `
    return <SvgXml xml={xmlString} />;
}

export const WatchlistAddedIconSVG = () => {
    return (
        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <Path d="M14 11C14 10.4477 13.5523 10 13 10H3C2.44772 10 2 10.4477 2 11V11C2 11.5523 2.44772 12 3 12H13C13.5523 12 14 11.5523 14 11V11ZM14 7C14 6.44772 13.5523 6 13 6H3C2.44772 6 2 6.44772 2 7V7C2 7.55228 2.44772 8 3 8H13C13.5523 8 14 7.55228 14 7V7ZM2 15C2 15.5523 2.44772 16 3 16H9C9.55228 16 10 15.5523 10 15V15C10 14.4477 9.55228 14 9 14H3C2.44772 14 2 14.4477 2 15V15ZM19.8473 12.2617C20.2413 11.8473 20.9019 11.847 21.2962 12.261L21.3437 12.3108C21.7113 12.6968 21.7115 13.3034 21.3441 13.6896L16.0662 19.2394C15.6725 19.6534 15.0126 19.654 14.6182 19.2408L11.7059 16.1897C11.3374 15.8036 11.3371 15.1961 11.7052 14.8096L11.7533 14.7591C12.1469 14.3458 12.8061 14.3452 13.2004 14.7579L15.3429 17L19.8473 12.2617Z" fill="white"/>
        </Svg>
    );
}