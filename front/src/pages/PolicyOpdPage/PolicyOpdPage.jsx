import React, { useLayoutEffect } from 'react'
import Header from '../../components/Home/Header/Header.jsx'
import PolicyOpd from '../../components/PolicyOpd/PolicyOpd.jsx'
import { Footer } from '../../components/Home/Footer/Footer.jsx'

export function PolicyOpdPage() {
	useLayoutEffect(() => {
		window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
	}, [])

	return (
		<>
			<Header />
			<main>
				<PolicyOpd />
			</main>
			<Footer />
		</>
	)
}

export default PolicyOpdPage
