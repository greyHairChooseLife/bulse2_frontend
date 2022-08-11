import React from 'react';
import './Calendar.css';


export const Calendar = () => {

	const today = new Date();

	const calendarHead = 
		<div>
			<div className="MonthName">{today.getMonth()+1}</div>
			<div className="DayName"><span>Mon</span><span>Tue</span><span>Wen</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span></div>
		</div>

	const days = [];

	const firstOf = new Date(today.getFullYear(), today.getMonth(), 1);
	const lastDate = new Date(today.getFullYear(), today.getMonth()+1, 0); 		//이달의 마지막 날
	const skippingCount = firstOf.getDay();		//건너뛰어야 할 날(요일) 개수

	for(var j=0; j<skippingCount; j++){
		days.push(<div className="SkippingDays"></div>)
	}
	for(var i=0; i<lastDate.getDate(); i++){
		days.push(<div className="EachDay">{i+1}</div>);
	}

	return (
		<div className="CalendarBox">
			{calendarHead}
			<div className="CalendarDays">
				{days}
			</div>
		</div>
	);
}
