import React, { useState, useEffect } from 'react';
import './_.css';

const today = new Date();

type pageModeType = 'logo' | 'readProject' | 'createProject' | 'updateProject' | 'deleteProject'
interface IcalendarPrpps {
	setTheDay: any
	setSession: any
	setPageMode: any
	pageMode: pageModeType
}
const EnToKr = ["일", "이", "삼", "사", "오", "육", "칠", "팔", "구", "십", "십일", "십이"];
export const Calendar = (props: IcalendarPrpps) => {

	const [ selectedDate, setSelectedDate ] = useState<number>(today.getDate());

			//<div className="DayName"><span>월</span><span>화</span><span>수</span><span>목</span><span>금</span><span>토</span><span>일</span></div>
	const calendarHead = 
		<div>
			<div className="MonthName">{today.getMonth()+1}</div>
			<div className="DayName"><span>ㅇ</span><span>ㅎ</span><span>ㅅ</span><span>ㅁ</span><span>ㄱ</span><span>ㅌ</span><span>ㅇ</span></div>
		</div>

	let days = [];

	const firstOf = new Date(today.getFullYear(), today.getMonth(), 1);
	const lastDate = new Date(today.getFullYear(), today.getMonth()+1, 0); 		//이달의 마지막 날
	const skippingCount = firstOf.getDay();		//건너뛰어야 할 날(요일) 개수

	//	0부터 적용하면 맨 앞에 일요일을 넣겠다는 것이다. 나는 월요일부터 표시하니까 1로 시작
	for(var j=1; j<skippingCount; j++) days.push(<div key={"SkippingDays"+j} className="SkippingDays"></div>)

	for(var i=0; i<lastDate.getDate(); i++) days.push(i+1);

	const handleOnClick = (i: number) => {
		if(i-skippingCount+2 >= 1){
			const newDate = today.getMonth()+1 <= 9 ? `${today.getFullYear()}-${'0'+(today.getMonth()+1)}-${i-skippingCount+2}`
				: `${today.getFullYear()}-${today.getMonth()+1}-${i-skippingCount+2}`;
			setSelectedDate(Math.abs(Number(newDate.substr(-2, 2))));
			if(props.pageMode !== 'createProject'){
				props.setTheDay(newDate)
				//	날짜가 바뀌면 pageMode와 session정보를 기본값('logo', undefined)으로 초기화 해 준다.
				props.setSession(undefined);
				props.setPageMode('logo');
			}else{
				if(window.confirm('작성 중이던 내용이 사라집니다.')){
					props.setTheDay(newDate)
					props.setSession(undefined);
					props.setPageMode('logo');
				}
			}
		}
	}

	days = days.map((ele, i) => {
		//	get className
		let className;
		if(typeof ele === 'number') className = 'EachDay';
		if(typeof ele !== 'number') className = 'EmptyDay';
		if(ele === today.getDate()) className = 'Today';
		if(typeof ele ==='number' && ele%5 === 0) className += ' ShowWord';
		if(ele === selectedDate) className += ' SelectedDate';
		return <div key={"EachDay"+i} className={className} onClick={() => handleOnClick(i)}>{ele === today.getDate() ? '오늘' : ele}</div>;
	})
//  for문 대신 map 매소드를 이용하면 각 반복마다의 고유한 index값을 사용하기 쉽다.
//	for(var i=0; i<lastDate.getDate(); i++){
//		days.push(<div className="EachDay" onClick={() => {}}>{i+1}</div>);
//	}

	return (
		<div className="CalendarBox">
			{calendarHead}
			<div className="CalendarDays">
				{days}
			</div>
		</div>
	);
}
