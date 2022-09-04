import React, { useState, useEffect } from 'react';
import './_.css';
import axios from 'axios';
import { useCookies } from 'react-cookie';

const api = axios.create({
	baseURL: `http://${process.env.REACT_APP_API_SERVER_HOST}:${process.env.REACT_APP_API_SERVER_PORT}`,
});

interface IscheduleProps {
	theDay: string
	setSession: any
	setPageMode: any
}
export const Schedule = (props: IscheduleProps) => {

	const [ cookies, setCookie, removeCookie ] = useCookies(['checkOverlapLike']);
	const defaultValue = {
		addOnSwitch: [false, false, false],
		isAddOnFixed: [false, false, false],
	}

	//	날짜가 바뀌면 현재 depth:0의 state들을 초기화 한다. scheduleStatus는 당연히 그 날짜의 session 데이터를 가져와서 update해준다.
	useEffect(() => {
		setPreviousState(['logo', undefined]);
		setAddOnSwitch(defaultValue.addOnSwitch);
		setIsAddOnFixed(defaultValue.isAddOnFixed);

		const setters = [setSchedule1Status, setSchedule2Status, setSchedule3Status];
		setters.forEach(ele => ele(null));
		const getProject = async () => {
			const result = await api.get(`/project?theDay=${props.theDay}`);
			result.data.forEach((ele: any) => setters[ele.session-1](ele.status));
		}
		getProject();
	}, [props.theDay]);

	//	pending : waiting for approve by administrator
	//	recruiting : recruiting for reservation
	//	confirmed : schedule confirmed
	type scheduleStatusType = 'pending' | 'recruiting' | 'confirmed';
	const [ schedule1Status, setSchedule1Status ] = useState<scheduleStatusType | null>(null);
	const [ schedule2Status, setSchedule2Status ] = useState<scheduleStatusType | null>(null);
	const [ schedule3Status, setSchedule3Status ] = useState<scheduleStatusType | null>(null);

	const [ schedule1Component, setSchedule1Component ] = useState<null | JSX.Element>(null);
	const [ schedule2Component, setSchedule2Component ] = useState<null | JSX.Element>(null);
	const [ schedule3Component, setSchedule3Component ] = useState<null | JSX.Element>(null);

	type pageModeType = 'logo' | 'readProject' | 'createProject' | 'updateProject' | 'deleteProject'
	type previousStateType = [pageModeType, number | undefined];
	const [ previousState, setPreviousState ] = useState<previousStateType>(['logo', undefined]);

	let events = {
		newProject: {
			onClick: (sessionNumber: number) => {
				if(previousState[0] !== 'readProject' && previousState[0] !== 'logo'){	//	logo 또는 readProject 모드라면 confirm() 필요 없으니 바로 else로 실행시킨다.
					if(sessionNumber !== previousState[1]){		//	세션이 바뀌지 않는 경우는 방금 활성화된 button을 눌렀다는 소리다. 그때는 이벤트가 일어나서는 안되지
						if(window.confirm('작성 중이던 내용이 사라집니다.')){
							props.setPageMode('createProject');
							props.setSession(sessionNumber);
							setPreviousState(['createProject', sessionNumber]);
						}
					}
				}else{
					props.setPageMode('createProject');
					props.setSession(sessionNumber);
					setPreviousState(['createProject', sessionNumber]);
				}
			}
		},
		pending: {
			onClick: (sessionNumber: number, previousState: any) => {
				if(previousState[0] !== 'readProject' && previousState[0] !== 'logo'){
					if(window.confirm('작성 중이던 내용이 사라집니다.')){
						setPreviousState(['readProject', sessionNumber]);
						props.setPageMode('readProject');
						props.setSession(sessionNumber);
					}
				}else{
					setPreviousState(['readProject', sessionNumber]);
				}
				const temp = [false, false, false];
				temp[sessionNumber-1] = true;
				setIsAddOnFixed(temp);
			},
			onMouseEnter: (sessionNumber: number, previousState: any) => {
				if(previousState[0] === 'logo' || previousState[0] === 'readProject'){
					props.setPageMode('readProject');
					props.setSession(sessionNumber);
				}
				const temp = [false, false, false];
				temp[sessionNumber-1] = true;
				setAddOnSwitch(temp);
			},
			onMouseLeave: (sessionNumber: number, previousState: any) => {
				//	create, update, delete 도중이었다면 그냥 사라져서는 안된다. 한번 물어봐야지.
				if(previousState[0] === 'readProject' || previousState[0] === 'logo'){
					props.setPageMode(previousState[0]);
					props.setSession(previousState[1]);
				}
				//	mouseLeave이벤트가 발생하는 요소와 addOn이 fix된 세션넘버가 다를 때에만 동작하도록 한다.
				if(isAddOnFixed.findIndex((ele) => ele === true) !== sessionNumber-1){
					const temp = [false, false, false];
					temp[isAddOnFixed.findIndex((ele) => ele === true)] = true;
					setAddOnSwitch(temp);
				}
			},
		},
		recruiting: {
			onClick: (sessionNumber: number, previousState: any) => {
				if(previousState[0] !== 'readProject' && previousState[0] !== 'logo'){
					if(window.confirm('작성 중이던 내용이 사라집니다.')){
						setPreviousState(['readProject', sessionNumber]);
						props.setPageMode('readProject');
						props.setSession(sessionNumber);
					}
				}else{
					setPreviousState(['readProject', sessionNumber]);
				}
				const temp = [false, false, false];
				temp[sessionNumber-1] = true;
				setIsAddOnFixed(temp);
			},
			onMouseEnter: (sessionNumber: number, previousState: any) => {
				if(previousState[0] === 'logo' || previousState[0] === 'readProject'){
					props.setPageMode('readProject');
					props.setSession(sessionNumber);
				}
				const temp = [false, false, false];
				temp[sessionNumber-1] = true;
				setAddOnSwitch(temp);
			},
			onMouseLeave: (sessionNumber: number, previousState: any) => {
				//	create, update, delete 도중이었다면 그냥 사라져서는 안된다. 한번 물어봐야지.
				if(previousState[0] === 'readProject' || previousState[0] === 'logo'){
					props.setPageMode(previousState[0]);
					props.setSession(previousState[1]);
				}
				//	mouseLeave이벤트가 발생하는 요소와 addOn이 fix된 세션넘버가 다를 때에만 동작하도록 한다.
				if(isAddOnFixed.findIndex((ele) => ele === true) !== sessionNumber-1){
					const temp = [false, false, false];
					temp[isAddOnFixed.findIndex((ele) => ele === true)] = true;
					setAddOnSwitch(temp);
				}
			},
		},
		confirmed: {
			onClick: (sessionNumber: number, previousState: any) => {
				if(previousState[0] !== 'readProject' && previousState[0] !== 'logo'){
					if(window.confirm('작성 중이던 내용이 사라집니다.')){
						setPreviousState(['readProject', sessionNumber]);
						props.setPageMode('readProject');
						props.setSession(sessionNumber);
					}
				}else{
					setPreviousState(['readProject', sessionNumber]);
				}
				const temp = [false, false, false];
				temp[sessionNumber-1] = true;
				setIsAddOnFixed(temp);
			},
			onMouseEnter: (sessionNumber: number, previousState: any) => {
				if(previousState[0] === 'logo' || previousState[0] === 'readProject'){
					props.setPageMode('readProject');
					props.setSession(sessionNumber);
				}
				const temp = [false, false, false];
				temp[sessionNumber-1] = true;
				setAddOnSwitch(temp);
			},
			onMouseLeave: (sessionNumber: number, previousState: any) => {
				//	create, update, delete 도중이었다면 그냥 사라져서는 안된다. 한번 물어봐야지.
				if(previousState[0] === 'readProject' || previousState[0] === 'logo'){
					props.setPageMode(previousState[0]);
					props.setSession(previousState[1]);
				}
				//	mouseLeave이벤트가 발생하는 요소와 addOn이 fix된 세션넘버가 다를 때에만 동작하도록 한다.
				if(isAddOnFixed.findIndex((ele) => ele === true) !== sessionNumber-1){
					const temp = [false, false, false];
					temp[isAddOnFixed.findIndex((ele) => ele === true)] = true;
					setAddOnSwitch(temp);
				}
			},
		},
	};

	const makeCreatingComponent = (sessionNumber: number) => {
		return <div
			onClick={() => events.newProject.onClick(sessionNumber)}
		>새로운 제안하기</div>;
	}

	const makePendingComponent = (sessionNumber: number, previousState: any) => {
		return <div
			onClick={() => events.pending.onClick(sessionNumber, previousState)}
			onMouseEnter={() => events.pending.onMouseEnter(sessionNumber, previousState)}
			onMouseLeave={() => events.pending.onMouseLeave(sessionNumber, previousState)}
		>관리자 승인을 기다리는 중입니다.</div> 
	}

	const makeRecruitingComponent = (sessionNumber: number, previousState: any) => {
		return <div
			onClick={() => events.recruiting.onClick(sessionNumber, previousState)}
			onMouseEnter={() => events.recruiting.onMouseEnter(sessionNumber, previousState)}
			onMouseLeave={() => events.recruiting.onMouseLeave(sessionNumber, previousState)}
		>참석자 모집 중입니다.</div>
	}

	const makeConfirmedComponent = (sessionNumber: number, previousState: any) => {
		return <div
			onClick={() => events.confirmed.onClick(sessionNumber, previousState)}
			onMouseEnter={() => events.confirmed.onMouseEnter(sessionNumber, previousState)}
			onMouseLeave={() => events.confirmed.onMouseLeave(sessionNumber, previousState)}
		>확정된 일정입니다.</div>
	}


	//	addOn 관련 내용
	type addOnSwitchType = boolean[];
	const [ addOnSwitch, setAddOnSwitch ] = useState<addOnSwitchType>(defaultValue.addOnSwitch);
	type isAddOnFixedType = boolean[];
	const [ isAddOnFixed, setIsAddOnFixed ] = useState<isAddOnFixedType>(defaultValue.isAddOnFixed);
	const [ addOn1, setAddOn1 ] = useState<any>(null);
	const [ addOn2, setAddOn2 ] = useState<any>(null);
	const [ addOn3, setAddOn3 ] = useState<any>(null);

	const [ likedList, setLikedList ] = useState<[string, number][]>([]);

	//	일단 쿠키 읽어와서 이미 좋아요 누른 것 기억 해 둔다.
	useEffect(() => {
		if(cookies.checkOverlapLike !== undefined){
			setLikedList([...cookies.checkOverlapLike.items]);
		}
	}, [])

	const addOnEvent = {
		pending: async (sessionNumber: number) => {
			//	likedList상태 값을 훑어서 선택한 theDay와 session이 존재한다면 event는 일어나지 않도록 한다.
			let notLikedYet = true;
			likedList.forEach(ele => {if(ele[0] === props.theDay && ele[1] === sessionNumber) notLikedYet = false;});
			if(notLikedYet){
				const result = await api.put('/project/likeCount', {theDay: props.theDay, session: sessionNumber});
				const accumulatedLikeRecord = {
					ip: result.data.affected.ip,
					//	기존 쿠키 업데이트
					items: cookies.checkOverlapLike !== undefined ? [...cookies?.checkOverlapLike.items, result.data.affected.item]
					: [result.data.affected.item]
				}

				setCookie('checkOverlapLike', JSON.stringify(accumulatedLikeRecord), {path: '/', maxAge: 60*60});	//	1시간 동안 유효
				setLikedList([...likedList, [props.theDay, sessionNumber]]);
			}
		},
		recruiting: () => {},
		confirmed: () => {},
	}

	const addOn = {
		pending: (sessionNumber: number) => <div><button onClick={() => addOnEvent.pending(sessionNumber)}>like</button></div>,
		recruiting: () => <div><button>예약</button><button>예약 취소</button></div>,
		confirmed: () => <div><button>예약 취소</button></div>,
	}

	//	선택 된 날짜의 3개 스케쥴(세션) 상태에 따라 걸맞는 컴포넌트를 생성 해 준다.
	//	addOn도 마찬가지.
	//	previousState도 넣어줘서 다른 컴포넌트 클릭 등 event 발생 시 조건으로 활용 해 준다. 예를 들어 previous가 어떤 form작성 중이라는 상태였다면 그 내용을 다 잃어도 좋은지 물어볼 수 있도록.
	//
	//	중요!!! 
	//	의존성 배열에 likedList 상태값 또한 들어가 있다. 왜냐? 이 useEffect훅의 경우 addOn에서 사용할 콜백함수를 정의한다. 근데 그 콜백함수는 likedList상태값을 이용하고 있다. 그렇다면 likedList가 업데이트 될 때마다 useEffect 또한 다시 실행되도록 하는것이 인지 상정이다. 그렇지 않다면 과거의 likedList 상태값을 가진채로 addOn의 콜백함수가 실행 될 것이다.
	useEffect(() => {
		const statuses = [schedule1Status, schedule2Status, schedule3Status];
		const setters = [setSchedule1Component, setSchedule2Component, setSchedule3Component];
		const addOnSetters = [setAddOn1, setAddOn2, setAddOn3];
		setters.forEach((ele: any, idx: number) => ele(makeCreatingComponent(idx+1)));
		statuses.forEach((ele: any, idx: number) => {
			switch(ele){
				case 'pending':
					setters[idx](makePendingComponent(idx+1, previousState));
					addOnSetters[idx](addOn.pending(idx+1));
					break;
				case 'recruiting':
					setters[idx](makeRecruitingComponent(idx+1, previousState));
					addOnSetters[idx](addOn.recruiting());
					break;
				case 'confirmed':
					setters[idx](makeConfirmedComponent(idx+1, previousState));
					addOnSetters[idx](addOn.confirmed());
					break;
			}
		})
	}, [schedule1Status, schedule2Status, schedule3Status, previousState, likedList]);

	return (
		<div className="ScheduleBox">
			<span>13:00 ~ 15:00</span>
			<div>{schedule1Component}{addOnSwitch[0] ? addOn1 : null}</div>
			<span>16:00 ~ 18:00</span>
			<div>{schedule2Component}{addOnSwitch[1] ? addOn2 : null}</div>
			<span>19:00 ~ 21:00</span>
			<div>{schedule3Component}{addOnSwitch[2] ? addOn3 : null}</div>
		</div>
	);
}
