import React, { useState, useEffect, Dispatch, SetStateAction } from 'react';
import './_.css';
import axios from 'axios';

const today = new Date();
const api = axios.create({
	baseURL: `http://${process.env.REACT_APP_API_SERVER_HOST}:${process.env.REACT_APP_API_SERVER_PORT}`,
})

interface IuserController {
	userSelectedReservation: any | null
	userSelectedProposal: any | null
	setRUS: any
	readUserSelected: any 
	setUserSelectedReservation: any
	setUserSelectedProposal: any
	setCRA: any
}
export const UserController = (props: IuserController) => {
	const onClickCancel = () => {
		if(props.userSelectedReservation !== null){
			if(props.userSelectedReservation.P_status === 'recruiting'){
				if(window.confirm('정말로 예약을 취소하시겠습니까?')) api.delete('/reservation', {data: {reservationId: props.userSelectedReservation.R_id}});
			}else if(props.userSelectedReservation.P_status === 'confirmed'){
				if(window.confirm('보증금이 반환되지 않습니다. 정말로 예약을 취소하시겠습니까?')) api.delete('/reservation', {data: {reservationId: props.userSelectedReservation.R_id}});
			}
			props.setUserSelectedReservation(null);		//	삭제한 뒤엔 해당 데이터가 state값에서도 사라져야 한다. 그래야 관련된 event triggred 된 것들 모두 깨끗하게 초기화 된다.
			props.setCRA(true);		//	Schedule component가 reservation 상태값을 업데이트 할 수 있도록 트리거 제공
		}
		if(props.userSelectedProposal !== null){
			if(props.userSelectedProposal.status === 'confirmed'){
				if(window.confirm('보증금이 반환되지 않습니다. 정말로 일정을 취소하시겠습니까?')) api.delete('/project', {data: {projectId: props.userSelectedProposal.id, projectStatus: props.userSelectedProposal.status}});
			}else{
				if(window.confirm('정말로 일정을 취소하시겠습니까?')) api.delete('/project', {data: {projectId: props.userSelectedProposal.id, projectStatus: props.userSelectedProposal.status}});
			}
			props.setUserSelectedProposal(null);		//	삭제한 뒤엔 해당 데이터가 state값에서도 사라져야 한다. 그래야 관련된 event triggred 된 것들 모두 깨끗하게 초기화 된다.
			props.setCRA(true);		//	Schedule component가 reservation 상태값을 업데이트 할 수 있도록 트리거 제공
		}
	}
	const askCheckPayment = 
		<>
			<p>신한은행</p>
			<p>110-324-564-274</p>
			<p>김상연</p>
			<p>* 보증금은 참석 확인 후 전액 반환됩니다.(불참시 반환 불가)<br /> * 입금자명에 [이름+예약번호]로 적어 주세요. ex) 홍길동19</p>
			<button onClick={() => {
				if(window.confirm('입금 완료하셨습니까?')) api.put('/reservation/askCheckPayment', {RID: props.userSelectedReservation.R_id}); 
				props.setUserSelectedReservation(null);
			}}>보증금 납부 확인요청</button>
		</>

	const controller = 
		<>
			{(props.readUserSelected[0] && props.readUserSelected[1] === 'content') ? <button className={props.readUserSelected[1] === 'content' ? 'CloseReadingRUS' : undefined} onClick={() => props.setRUS([false, undefined])}>닫기</button> : <button onClick={() => props.setRUS([true, 'content'])}>내용 보기</button>}
			{props.userSelectedReservation?.R_checkPayment === null && askCheckPayment}
			{props.userSelectedProposal?.status !== 'broken' && <button className="CancelActionBtn" onClick={onClickCancel}>{props.userSelectedProposal === null ? '예약 취소' : '일정 취소'}</button>}
			{props.userSelectedProposal?.status === 'broken' && ((props.readUserSelected[0] && props.readUserSelected[1] === 'comment') ? 
				<button className="CloseReadingRejection" onClick={() => props.setRUS([false, undefined])}>닫기</button>
				: <button onClick={() => props.setRUS([true, 'comment'])}>반려 보기</button>)}
		</>

	return (
		<div className="UserController">
			{((props.userSelectedReservation !== null || props.userSelectedProposal !== null) && props.userSelectedReservation?.P_status !== 'broken') && controller}
		</div>
	);
}


interface IrelatedProject {
	identity: any
	setUserSelectedReservation: any
	setUserSelectedProposal: any
	userSelectedReservation: any
	userSelectedProposal: any
}
export const RelatedProject = (props: IrelatedProject) => {
	const [ mode, setMode ] = useState<'reservation' | 'proposal'>(props.userSelectedProposal !== null ? 'proposal' : 'reservation');
	const [ userRecord, setUserRecord ] = useState<any>(null);

	const [ brokenHide, setBrokenHide ] = useState<boolean>(false);

	useEffect(() => {
		const getUserRecord = async () => {
			const result = await api.get('/project/userRecord', {params: {when: today.getFullYear(), who: props.identity}});
			//	타임존 반영해서 형식 변경
			const proposal = result.data.proposal.map((ele: any) => {
				const origin = new Date(ele.date);
				ele.date = `${origin.getFullYear()} / ${origin.getMonth()+1 <= 9 ? '0'+(origin.getMonth()+1) : origin.getMonth()+1} / ${origin.getDate() <= 9 ? '0' + origin.getDate() : origin.getDate()}`;
				return {...ele};
			})
			const reservation = result.data.reservation.map((ele: any) => {
				const origin = new Date(ele.P_date);
				ele.P_date = `${origin.getFullYear()} / ${origin.getMonth()+1 <= 9 ? '0'+(origin.getMonth()+1) : origin.getMonth()+1} / ${origin.getDate() <= 9 ? '0' + origin.getDate() : origin.getDate()}`;
				return {...ele};
			})
			setUserRecord({proposal: proposal, reservation: reservation});
		}
		getUserRecord();
	}, [props.userSelectedReservation, props.userSelectedProposal])

	const onClickReservationTR = (e: any, idx: number) => {
		props.setUserSelectedReservation(e);
	}
	const onClickProposalTR = (e: any, idx: number) => {
		props.setUserSelectedProposal(e);
	}

	let tableHead = null;
	let tableBody = null;
	if(userRecord !== null){
		switch(mode){
			case 'reservation':
				tableHead =	
						<tr>
							<th>날짜</th>
							<th>세션</th>
							<th>제목</th>
							<th>보증금납부</th>
							<th>예약번호</th>
							<th>상태</th>
						</tr>
				tableBody = userRecord.reservation.map((e: any, idx: number, arr: any) => {
					const tdPayment = e.R_payment === 0 ? 'Paid' : '';
					const selectedClassName = props.userSelectedReservation !== null && e.R_id === props.userSelectedReservation.R_id ? 'SelectedTR' : undefined;
					if(!brokenHide){
						if(e.P_status === 'broken') return;
					}
					return (
						<tr key={'tr_No.'+idx} onClick={() => {onClickReservationTR(e, idx)}} className={selectedClassName}>
							<td>{e.P_date.substr(7)}</td>
							<td>{e.P_session}</td>
							<td>{e.P_subject}</td>
							<td className={tdPayment}>{e.R_payment === 0 ? '미확인' : '완료'} {e.R_payment !== 0 ? null : e.R_checkPayment === null ? null : <span className="BlueText">요청 완료</span>}</td>
							<td>{e.R_id}</td>
							<td>{e.P_status}</td>
						</tr>
					)
				})
				break;
			case 'proposal':
				//	추후 보증금 납부 내역도 넣어주자. 지금은 project 테이블 자체에 해당 column이 없다.
				tableHead =
						<tr>
							<th>날짜</th>
							<th>세션</th>
							<th>제목</th>
							<th>상태</th>
							<th>조회수</th>
						</tr>
				tableBody = userRecord.proposal.map((e: any, idx: number, arr: any) => {
					const selectedClassName = props.userSelectedProposal !== null && e.id === props.userSelectedProposal.id ? 'SelectedTR' : undefined;
					if(!brokenHide){
						if(e.status === 'broken') return;
					}
					return (
						<tr key={'tr_No.'+idx} onClick={() => {onClickProposalTR(e, idx)}} className={selectedClassName}>
							<td>{e.date.substr(7)}</td>
							<td>{e.session}</td>
							<td>{e.subject}</td>
							<td>{e.status}</td>
							<td>{e.expose_count}</td>
						</tr>
					)
				})
				break;
		}
	}

	const onChangeMode = (newMode: 'reservation' | 'proposal') => {
		setMode(newMode);
		props.setUserSelectedReservation(null);
		props.setUserSelectedProposal(null);
	}

	return (
		<div className="RelatedProject">
			<div>
				<button className={mode === 'reservation' ? 'SelectedTable' : 'NotSelectedTable'} onClick={() => {onChangeMode('reservation')}}>듣기</button>
				<button className={mode === 'proposal' ? 'SelectedTable' : 'NotSelectedTable'} onClick={() => {onChangeMode('proposal')}}>말하기</button>
			</div>
			<input type="checkbox" checked={brokenHide} onChange={(e) => {
				if(e.target.checked) setBrokenHide(true);
				else setBrokenHide(false);
			}} />
			<span onClick={() => {
				if(brokenHide) setBrokenHide(false);
				else setBrokenHide(true);
			}}>취소 된 일정 표시</span>
			<table>
				<thead>
					{tableHead}
				</thead>
				<tbody>
					{tableBody}
				</tbody>
			</table>
		</div>
	)
}


interface IuserInfoModal {
	userSelectedReservation: any | null
	userSelectedProposal: any | null
	readUserSelected: any
}
export const UserInfoModal = (props: IuserInfoModal) => {

	let ele = null;
	if(props.userSelectedReservation !== null) {
		ele = 
			<div className="ReadUserSelectedBox">
				<div>
					<div>
						{props.userSelectedReservation.P_subject}
					</div>
					<div>
						{props.userSelectedReservation.P_content}
					</div>
				</div>
				<div>
					<span>by {props.userSelectedReservation.P_name}, </span>
					<span>{props.userSelectedReservation.P_mobileNumber}</span>
				</div>
			</div>
	}else if(props.userSelectedProposal !== null){
		if(props.readUserSelected[1] === 'content'){
			ele = 
				<div className="ReadUserSelectedBox">
					<div>
						<div>
							{props.userSelectedProposal.subject}
						</div>
						<div>
							{props.userSelectedProposal.content}
						</div>
					</div>
				</div>
		}else if(props.readUserSelected[1] === 'comment'){
			ele = 
				<div className="ReadUserSelectedBox">
					<div>
						<div>
							"{props.userSelectedProposal.executor === 'admin' ? '관리자' : '스스로'}가 아래와 같은 이유로 반려 또는 취소 했습니다."
						</div>
						<div>
							{props.userSelectedProposal.comment}
						</div>
					</div>
				</div>
		}
	}

	return (
		<>
			{ele}
		</>
	)
}

