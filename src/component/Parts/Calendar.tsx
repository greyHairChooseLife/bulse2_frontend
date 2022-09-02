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
export const Calendar = (props: IcalendarPrpps) => {

	const calendarHead = 
		<div>
			<div className="MonthName">{today.getMonth()+1}</div>
			<div className="DayName"><span>Mon</span><span>Tue</span><span>Wen</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span></div>
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
			if(props.pageMode !== 'createProject'){
				props.setTheDay(`${today.getFullYear()}-${today.getMonth()+1}-${i-skippingCount+2}`)
				//	날짜가 바뀌면 pageMode와 session정보를 기본값('logo', undefined)으로 초기화 해 준다.
				props.setSession(undefined);
				props.setPageMode('logo');
			}else{
				if(window.confirm('작성 중이던 내용이 사라집니다.')){
					props.setTheDay(`${today.getFullYear()}-${today.getMonth()+1}-${i-skippingCount+2}`)
					props.setSession(undefined);
					props.setPageMode('logo');
				}
			}
		}
	}

	days = days.map((ele, i) => {
		return <div key={"EachDay"+i} className="EachDay" onClick={() => handleOnClick(i)}>{ele}</div>;
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
