import { ThemeProvider } from '@emotion/react'
import { useSelector, useDispatch } from 'react-redux'
import { useState, useEffect } from 'react'
import { RootState, AppDispatch } from '../actions/store'
import { loadStoredContracts } from '../actions/thunks/contractThunks'
import { themes } from '../ui/themes'
import Layout from '../ui/components/Layout'
import ToastContainer from '../ui/components/ToastContainer'
import WalletInfoPage from '../ui/pages/WalletInfoPage'
import TransactionPage from '../ui/pages/TransactionPage'
import ContractPage from '../ui/pages/ContractPage'

function App() {
  const dispatch = useDispatch<AppDispatch>()
  const currentTheme = useSelector((state: RootState) => state.settings.theme)
  const theme = themes[currentTheme]
  const [currentPage, setCurrentPage] = useState<'wallet' | 'transaction' | 'contract' | 'settings'>('wallet')

  useEffect(() => {
    // アプリ起動時にローカルストレージからコントラクト情報を読み込み
    dispatch(loadStoredContracts())
  }, [dispatch])

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
      <ToastContainer />
    </ThemeProvider>
  )
}

export default App