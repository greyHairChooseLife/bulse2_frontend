import React, { useState, useEffect, Dispatch, SetStateAction } from 'react';
import './_.css';
import axios from 'axios';

const today = new Date();
const api = axios.create({
	baseURL: `http://${process.env.REACT_APP_API_SERVER_HOST}:${process.env.REACT_APP_API_SERVER_PORT}`,
})

interface IuserInfo {
	identity: any
}
export const UserInfo = (props: IuserInfo) => {
	return (
		<div className="Info">
			<div>
				<p>{props.identity.name}</p>
				<p>{props.identity.mobileNumber}</p>
			</div>
		</div>
	)
}

interface IrelatedProject {
	identity: any
}
export const RelatedProject = (props: IrelatedProject) => {
	
	const [ mode, setMode ] = useState<'reservation' | 'proposal'>('reservation');
	const [ userRecord, setUserRecord ] = useState<any>(null);

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
	}, [])

	const [ showDM, setShowDM ] = useState<boolean>(false);	//	입금 안내와 확인 요청기능 창의 on-off
	const [ depositRID, setDepositRID ] = useState<number | undefined>(undefined);	//	입금 확인 요청 시 admin에게 식별용으로 넘겨주는 예약ID
	const depositMsg: any = 	
			<div className="Deposit">
				<div>신한은행</div>
				<div>110-324-564-274</div>
				<div>김상연</div>
				<div><div>"입금 시 메시지에 이름과 프로젝트 번호를 써 주세요."</div><div>예시) 홍길동15</div></div>
				<button onClick={()=>{
					api.put('/reservation//askCheckPayment', {RID: depositRID});
					setShowDM(false);
				}}>입금완료, 확인 요청</button>
			</div>

	const askConfirmBtn = (RID: number) => {
		return (
			<button onClick={() => {
				setDepositRID(RID);
				setShowDM(true);
			}}>확인 요청</button>
		)
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
							<th>상태</th>
						</tr>
				tableBody = userRecord.reservation.map((e: any, idx: number, arr: any) => {
					const tdPayment = e.R_payment === 0 ? 'Paid' : '';
					console.log('sexxxx: ', e.R_checkPayment === null);
					return (
						<tr key={'tr_No.'+idx}>
							<td>{e.P_date.substr(7)}</td>
							<td>{e.P_session}</td>
							<td>{e.P_subject}</td>
							<td className={tdPayment}>{e.R_payment === 0 ? '미확인' : '완료'} {e.R_payment !== 0 ? null : e.R_checkPayment === null ? askConfirmBtn(e.R_id) : <span className="BlueText">요청 완료</span>}</td>
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
					return (
						<tr key={'tr_No.'+idx}>
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

	const onChangeMode = (newMode: 'reservation' | 'proposal') => {setMode(newMode)}

	return (
		<div className="Project">
			<div>
				<button onClick={() => {onChangeMode('reservation')}}>듣기</button>
				<button onClick={() => {onChangeMode('proposal')}}>말하기</button>
			</div>
			<table>
				<thead>
					{tableHead}
				</thead>
				<tbody>
					{tableBody}
				</tbody>
			</table>
			{showDM && depositMsg}
			{showDM && <div className="DepositBG" onClick={() => {setShowDM(!showDM)}}></div>}
		</div>
	)
}
