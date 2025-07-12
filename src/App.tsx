import { ThemeProvider } from '@emotion/react'
import { useSelector } from 'react-redux'
import { useState } from 'react'
import { RootState } from '../actions/store'
import { themes } from '../ui/themes'
import Layout from '../ui/components/Layout'
import WalletInfoPage from '../ui/pages/WalletInfoPage'
import TransactionPage from '../ui/pages/TransactionPage'
import ContractPage from '../ui/pages/ContractPage'

function App() {
  const currentTheme = useSelector((state: RootState) => state.settings.theme)
  const theme = themes[currentTheme]
  const [currentPage, setCurrentPage] = useState<'wallet' | 'transaction' | 'contract' | 'settings'>('wallet')

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'wallet':
        return <WalletInfoPage />
      case 'transaction':
        return <TransactionPage />
      case 'contract':
        return <ContractPage />
      case 'settings':
        return <div>設定画面（開発中）</div>
      default:
        return <WalletInfoPage />
    }
  }

  return (
    <ThemeProvider theme={theme}>
      <Layout currentPage={currentPage} onPageChange={setCurrentPage}>
        {renderCurrentPage()}
      </Layout>
    </ThemeProvider>
  )
}

export default App