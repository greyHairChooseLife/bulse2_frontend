import React, { useState, useEffect, Dispatch, SetStateAction } from 'react';
import './_.css';
import axios from 'axios';

const api = axios.create({
	baseURL: `http://${process.env.REACT_APP_API_SERVER_HOST}:${process.env.REACT_APP_API_SERVER_PORT}`,
})

interface IuserInfo {
	identity: any
}
export const UserInfo = (props: IuserInfo) => {
	console.log(props.identity);
	return (
		<div className="Info">
			<div>
				<p>Name</p>
				<p>Number</p>
			</div>
			<div>
				<p>제안자 등록</p>
				<div>
					<label>은행명</label>
					<input placeholder="OO은행"></input>
					<label>계좌번호</label>
					<input placeholder="숫자만 써 주세요"></input>
					<label>소유자</label>
					<input placeholder="홍길동"></input>
					<button>등록하기</button>
				</div>
			</div>
		</div>
	)
}

export const RelatedProject = () => {
	return (
		<div className="RelatedProject">
			related
		</div>
	)
}
