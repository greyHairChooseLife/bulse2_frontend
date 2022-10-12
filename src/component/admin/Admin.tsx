import React, { useState, useEffect, Dispatch, SetStateAction } from 'react';
import './_.css';
import axios from 'axios';

const api = axios.create({
	baseURL: `http://${process.env.REACT_APP_API_SERVER_HOST}:${process.env.REACT_APP_API_SERVER_PORT}`,
})

type projectType = {
	project: {
		date: string,
		session: number,
		id: number,
		name: string,
		mobileNumber: string,
		subject: string,
		content: string,
		status: string,
		exposeCount: number,
		likeCount: number
	},
	reservation: {
		id: number,
		device: string,
		payment: boolean,
		check_payment: string,
		name: string,
		mobileNumber: string
	}[]
}

interface IProjectBoard {
	theDay: string
	setSelectedProject: Dispatch<SetStateAction<projectType | null>>
	selectedProject: projectType | null
	updateAdmin: boolean
	setSelectedBP: any | undefined
}
export const ProjectBoard = (props: IProjectBoard) => {

	const [ project, setProject ] = useState<projectType[]>([]);
	const [ brokenProject, setBrokenProject ] = useState<any[]>([]);
	const [ brokenHide, setBrokenHide ] = useState<boolean>(false);

	//	theDay가 속하는 달의 project를 업데이트 해 준다.
	useEffect(() => {
		const theMonth = props.theDay.split('-')[1];
		const getProject = async () => {
			const result = await api.get('/project/month', {params: {theMonth: theMonth}})
			setProject(result.data.PnR.map((ele: any) => {
				//	타임존 반영해서 형식 변경
				const origin = new Date(ele.project.date);
				ele.project.date = `${origin.getFullYear()}-${origin.getMonth()+1 <= 9 ? '0'+(origin.getMonth()+1) : origin.getMonth()+1}-${origin.getDate() <= 9 ? '0' + origin.getDate() : origin.getDate()}`;
				return {...ele};
			}));
			setBrokenProject(result.data.PnBP)
		}
		getProject();
	}, [props.selectedProject])


	return (
		<div className="Board">
			<input type="checkbox" checked={brokenHide} onChange={(e) => {
				if(e.target.checked) setBrokenHide(true);
				else setBrokenHide(false);
				props.setSelectedProject(null)
			}} />
			<span onClick={() => {
				if(brokenHide) setBrokenHide(false);
				else setBrokenHide(true);
				props.setSelectedProject(null)
			}}>취소 된 일정 표시</span>
			<table>
				<thead>
					<tr>
						<th>date</th>
						<th>session</th>
						<th>status</th>
						<th>subject</th>
						<th>name / number</th>
						<th>expose</th>
						<th>like</th>
						<th>reservated</th>
						<th>paid ratio</th>
						<th>id</th>
					</tr>
				</thead>
				<tbody>
					{project.map((e: any, idx: number, arr: any) => {
						if(!brokenHide){ if(e.project.status === 'broken') return; }
						const paidCount = e.reservation.reduce((prev: any, curr: any) => {return curr.payment === 0 ? prev : curr.payment === null ? prev : prev+1}, 0)
						let checkPayment = null;
						e.reservation.forEach((ele: any) => {if(ele.check_payment !== null && ele.payment === 0) checkPayment = <span className="checkPaymentAlarm">?</span>})
						const selectedClassName = (props.selectedProject !== null && e.project.id === props.selectedProject.project.id) ? 'SelectedTR' 
							: (e.project.status === 'broken') ? 'BrokenReservationTR' : undefined;
						return (
							<tr key={'tr_No.'+idx} className={selectedClassName} onClick={() => {
								props.setSelectedProject(e)
								props.setSelectedBP(brokenProject.find((ele: any) => ele.projectId === e.project.id));
							}}>
								<td>{idx === 0 ? e.project.date.substr(5) : arr[idx-1].project.date !== e.project.date ? e.project.date.substr(5) : ''}</td>
								<td>{e.project.session}</td>
								{e.project.status === 'pending' ? <td className="StatusPending">{e.project.status}</td>
								: e.project.status === 'recruiting' ? <td className="StatusRecruiting">{e.project.status}</td>
								: e.project.status === 'confirmed' ? <td className="StatusConfirmed">{e.project.status}</td>
								: e.project.status === 'broken' ? <td className="StatusBroken">{e.project.status}</td>
								: null}
								<td>{e.project.subject.substr(0, 13)}{e.project.subject.length > 13 && '...'}</td>
								<td>{e.project.name} / {e.project.mobileNumber.substr(3, 4)+'-'+e.project.mobileNumber.substr(7, 4)}</td>
								<td>{e.project.exposeCount}</td>
								<td>{e.project.likeCount}</td>
								<td>{e.reservation[0].id === null ? 0 : e.reservation.length}</td>
								<td>{checkPayment} {paidCount}/{e.reservation[0].id === null ? 0 : e.reservation.length}</td>
								<td>{e.project.id}</td>
							</tr>
						)
					})}
				</tbody>
			</table>
		</div>
	)
}


interface IProjectController {
	selectedProject: projectType | null
	setSelectedProject: Dispatch<SetStateAction<projectType | null>>
	showDetail: [boolean, string]
	setShowDetail: Dispatch<SetStateAction<[boolean, string]>>
}
export const ProjectController = (props: IProjectController) => {

	const [ commentOnOff, setCommentOnOff ] = useState<boolean>(false);
	const [ comment, setComment ] = useState<string>('');

	const onChangeTextField = (e: any) => {
		setComment(e.target.value);
	}

	useEffect(() => {setCommentOnOff(false)}, [props.selectedProject])	//	선택한 프로젝트가 바뀌면 코멘트 창 닫기

	//	프로젝트 승인 이벤트. pending 상태인 프로젝트에 취하는 액션
	const approveProject = () => {
		if(window.confirm('정말로 승인하시겠습니까? "예"를 누르시면 즉시 예약 가능 상태로 전환됩니다.')){
			api.put('/project/status', {byWhom: 'admin', toDo: 'approve', projectId: props.selectedProject?.project.id})
			props.setSelectedProject(null);
			alert('승인되었습니다.');
		}
	}

	//	프로젝트 확정 이벤트. recruiting 상태인 프로젝트에 취하는 액션
	const confirmProject = () => {
		if(window.confirm('정말로 확정하시겠습니까?')){
			api.put('/project/status', {byWhom: 'admin', toDo: 'confirm', projectId: props.selectedProject?.project.id})
			props.setSelectedProject(null);
			alert('확정되었습니다.');
		}
	}
	
	//	프로젝트 반려 이벤트. pending 상태인 프로젝트에 취하는 액션
	const rejectProject = () => {
		if(window.confirm('이 결정은 되돌릴 수 없습니다. 정말로 반려하시겠습니까?')){
			api.put('/project/status', {byWhom: 'admin', toDo: 'reject', projectId: props.selectedProject?.project.id, projectStatus: props.selectedProject?.project.status, comment: comment})
			props.setSelectedProject(null);
			alert('반려되었습니다.');
		}
	}
	const commentFormForReject = 
		<div className="commentForm">
			<p>반려 사유를 적어주세요.</p>
			<textarea placeholder="분명하게 설명 해 주세요." onChange={onChangeTextField}></textarea>
			<button onClick={() => {setCommentOnOff(false)}}>취소</button>
			<button onClick={rejectProject}>확인</button>
		</div>
	
	//	프로젝트 취소 이벤트. recruiting 또는 confirmed 상태
	const cancelProject = () => {
		if(window.confirm('이 결정은 되돌릴 수 없습니다. 정말로 취소하시겠습니까?')){
			api.put('/project/status', {byWhom: 'admin', toDo: 'cancel', projectId: props.selectedProject?.project.id, projectStatus: props.selectedProject?.project.status, comment: comment})
			props.setSelectedProject(null);
			alert('취소되었습니다. 제안자 및 참석 예약자들에게 정확히 안내 바랍니다.');
		}
	}
	const commentFormForCancel = 
		<div className="commentForm">
			<p>취소 사유를 적어주세요.</p>
			<textarea placeholder="분명하게 설명 해 주세요." onChange={onChangeTextField}></textarea>
			<button onClick={() => {setCommentOnOff(false)}}>취소</button>
			<button onClick={cancelProject}>확인</button>
		</div>


	let actions = null;
	switch(props.selectedProject?.project.status){
		case 'pending':
			actions = 
				<>
					<button onClick={() => {props.setShowDetail([!props.showDetail[0], ''])}}>상세 보기</button>
					<button onClick={approveProject}>승인</button>
					<button onClick={() => {setCommentOnOff(!commentOnOff)}}>반려</button>
					{commentOnOff && commentFormForReject}
				</>
			break;
		case 'recruiting':
			actions = 
				<>
					<button onClick={() => {props.setShowDetail([!props.showDetail[0], ''])}}>상세 보기</button>
					<button onClick={confirmProject}>최종 확정</button>
					<button onClick={() => {setCommentOnOff(!commentOnOff)}}>강제 취소</button>
					{commentOnOff && commentFormForCancel}
				</>
			break;
		case 'confirmed':
			actions = 
				<>
					<button onClick={() => {props.setShowDetail([!props.showDetail[0], ''])}}>상세 보기</button>
					<button className="Hide"></button>
					<button onClick={() => {setCommentOnOff(!commentOnOff)}}>강제 취소</button>
					{commentOnOff && commentFormForCancel}
				</>
			break;
		case 'broken':
			actions = 
				<>
					<button onClick={() => {props.setShowDetail([!props.showDetail[0], ''])}}>상세 보기</button>
					<button onClick={() => {props.setShowDetail([!props.showDetail[0], 'broken'])}}>반려 보기</button>
				</>
			break;
	}

			//{props.selectedProject !== null && <div>{props.selectedProject?.project.status}</div>}
	return (
		<div className="Controller">
			{actions}
			<div>{props.selectedProject?.project.status}</div>
		</div>
	)
}


interface IProjectClipboard {
	selectedProject: projectType | null
	updateAdmin: boolean
	setUpdateAdmin: any
}
export const ProjectClipboard = (props: IProjectClipboard) => {
	//	클립보드로 복사하는 기능. navigator 전역 객체에서 지원한다.
	const copyIt = (e: any) => {
		navigator.clipboard.writeText(e.target.innerText)
	}

	let projectTable = null;
	let reservationTable = null;
	if(props.selectedProject !== null){
		const {id, subject, mobileNumber, name, date} = props.selectedProject.project;
		projectTable =
			<table>
				<thead>
					<tr>
						<th>프로젝트 ID</th>
						<th>제목</th>
						<th>전화번호</th>
						<th>이름</th>
						<th>날짜</th>
					</tr>
				</thead>
				<tbody>
					<tr onClick={copyIt}>
						<td>{id}</td>
						<td>{subject}</td>
						<td>{mobileNumber}</td>
						<td>{name}</td>
						<td>{date}</td>
					</tr>
				</tbody>
			</table>

		let reservator = null;
		if(props.selectedProject.reservation[0].id !== null){
			reservator = props.selectedProject.reservation.map((ele: any) => {return [ele.id, ele.name, ele.mobileNumber, ele.payment, ele.check_payment]}).
				map((ele: any, idx: number) => {
					const depositCtrl = ele[4] !== null && ele[3] === 0 ? 
						//	아래 button 두개에 들어가는 onClick이벤트는 현재 또는 상위 컴포넌트를 리렌더링 시키지 않는다. 즉 의도 한 대로 DB에 영향은 미치지만 user가 화면상에서 즉시 피드백 받지 못한다.
						//	굳이 굳이 만들자면 만들 수는 있다. 그러나 이건 일단 그냥 두기로 한다. 추후 더 많은 리액트 훅과 디자인 패턴을 공부하면서 개선해 나갈 수 있을 것이다.
						<td>
							<button onClick={() => {
								if(window.confirm('입금 확인 되었습니까?')){
									api.put('reservation', {RID: ele[0], payment: true});
									props.setUpdateAdmin(!props.updateAdmin);
								}
							}}>입금확인</button>
							<button onClick={() => {
								if(window.confirm('잘 확인했나요?')){
									api.put('reservation/askCheckPayment', {RID: ele[0], deny: true});
									props.setUpdateAdmin(!props.updateAdmin);
								}
							}}>요청취소</button>
						</td>
						: null;
					return (
						<tr key={'reservator_No.'+idx} onClick={copyIt}>
							<td>{ele[0]}</td>
							<td>{ele[1]}</td>
							<td>{ele[2]}</td>
							<td>{ele[3] !== 0 ? '납부완료' : ele[4] !== null ? <span className="checkPaymentAlert">확인 요청: {ele[4]}</span> : '미납'}</td>
							{depositCtrl}
						</tr>
					)
				})
		}
		reservationTable =
			<table>
				<thead>
					<tr>
						<th>예약번호</th>
						<th>이름</th>
						<th>전화번호</th>
						<th>보증금 납부 여부</th>
						<th></th>
					</tr>
				</thead>
				<tbody>
					{reservator}
				</tbody>
			</table>
	}

	return (
		<div className="Clipboard">
			{projectTable}
			{reservationTable}
		</div>
	)
}


interface IProjectDetail {
	showWhat: string
	selectedProject: projectType | null
	selectedBP: any
}
export const ProjectDetail = (props: IProjectDetail) => {
	if(props.showWhat === 'projectDetail'){
		return ( 
			<div className="Detail">
				<div>
					{props.selectedProject?.project.subject}
				</div>
				<div>
					{props.selectedProject?.project.content}
				</div>
			</div>
		)
	}else{
		return ( 
			<div className="Detail">
				<div>
					by : {props.selectedBP?.executor}<br/> status : {props.selectedBP?.brokeOn}
				</div>
				<div>
					{props.selectedBP?.comment}
				</div>
			</div>
		)
	}
}


interface ISelectedProjectSummary {
	selectedProject: projectType | null
}
export const SelectedProjectSummary = (props: ISelectedProjectSummary) => {
	return (
		<div className="SelectedProjectSummary">
			{props.selectedProject !== null && <div>{props.selectedProject?.project.date} (session: {props.selectedProject?.project.session})</div>}
			{props.selectedProject !== null && <div>{props.selectedProject?.project.name}, {props.selectedProject?.project.mobileNumber}</div>}
			{props.selectedProject !== null && <div>{props.selectedProject?.project.subject}</div>}
		</div>
	)
}
