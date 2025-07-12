import { css } from '@emotion/react'
import { useTheme } from '@emotion/react'
import { Theme } from '../themes'
import { GasEstimate } from '../../actions/slices/transactionSlice'

interface GasEstimateDisplayProps {
  gasEstimate: GasEstimate
}

const GasEstimateDisplay: React.FC<GasEstimateDisplayProps> = ({ gasEstimate }) => {
  const theme = useTheme() as Theme

  return (
    <div css={containerStyle(theme)}>
      <h4 css={titleStyle(theme)}>ガス見積もり</h4>
      <div css={gridStyle}>
        <div css={itemStyle}>
          <span css={labelStyle(theme)}>ガス制限:</span>
          <span css={valueStyle(theme)}>{Number(gasEstimate.gasLimit).toLocaleString()}</span>
        </div>
        <div css={itemStyle}>
          <span css={labelStyle(theme)}>ガス価格:</span>
          <span css={valueStyle(theme)}>{gasEstimate.gasPrice} Gwei</span>
        </div>
        <div css={itemStyle}>
          <span css={labelStyle(theme)}>推定手数料:</span>
          <span css={valueStyle(theme)}>{gasEstimate.estimatedFee} ETH</span>
        </div>
      </div>
    </div>
  )
}

const containerStyle = (theme: Theme) => css`
  background-color: ${theme.colors.surface};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.md};
  margin-bottom: 1rem;
`

const titleStyle = (theme: Theme) => css`
  font-size: 1rem;
  margin: 0 0 ${theme.spacing.sm} 0;
  color: ${theme.colors.text};
`

const gridStyle = css`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
`

const itemStyle = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const labelStyle = (theme: Theme) => css`
  font-size: 0.8rem;
  color: ${theme.colors.textSecondary};
`

const valueStyle = (theme: Theme) => css`
  font-size: 0.8rem;
  color: ${theme.colors.text};
  font-weight: 500;
`

export default GasEstimateDisplay