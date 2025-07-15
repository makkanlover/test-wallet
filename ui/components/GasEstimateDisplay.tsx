import React from 'react'
import { css } from '@emotion/react'
import { useTheme } from '@emotion/react'
import { Theme } from '../themes'
import { GasEstimate } from '../../actions/slices/transactionSlice'

interface GasEstimateDisplayProps {
  gasEstimate: GasEstimate
}

const GasEstimateDisplay: React.FC<GasEstimateDisplayProps> = ({ gasEstimate }) => {
  const theme = useTheme() as Theme
  const hasBufferInfo = gasEstimate.actualGasPrice && gasEstimate.actualEstimatedFee

  return (
    <div css={containerStyle(theme)}>
      <h4 css={titleStyle(theme)}>ガス見積もり</h4>
      <div css={gridStyle}>
        <div css={itemStyle}>
          <span css={labelStyle(theme)}>ガス制限:</span>
          <span css={valueStyle(theme)}>{Number(gasEstimate.gasLimit).toLocaleString()}</span>
        </div>
        <div css={itemStyle}>
          <span css={labelStyle(theme)}>ガス価格 (基本):</span>
          <span css={valueStyle(theme)}>{gasEstimate.gasPrice} Gwei</span>
        </div>
        {hasBufferInfo && (
          <div css={itemStyle}>
            <span css={labelStyle(theme)}>ガス価格 (実際):</span>
            <span css={actualValueStyle(theme)}>{gasEstimate.actualGasPrice} Gwei</span>
          </div>
        )}
        <div css={itemStyle}>
          <span css={labelStyle(theme)}>推定手数料 (基本):</span>
          <span css={valueStyle(theme)}>{gasEstimate.estimatedFee} ETH</span>
        </div>
        {hasBufferInfo && (
          <div css={itemStyle}>
            <span css={labelStyle(theme)}>推定手数料 (実際):</span>
            <span css={actualValueStyle(theme)}>{gasEstimate.actualEstimatedFee} ETH</span>
          </div>
        )}
      </div>
      {hasBufferInfo && (
        <div css={noteStyle(theme)}>
          <small>実際の値にはガス倍率設定が適用されています</small>
        </div>
      )}
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

const actualValueStyle = (theme: Theme) => css`
  font-size: 0.8rem;
  color: ${theme.colors.primary};
  font-weight: 600;
`

const noteStyle = (theme: Theme) => css`
  margin-top: ${theme.spacing.sm};
  padding: ${theme.spacing.xs};
  background-color: ${theme.colors.primary}15;
  border-radius: ${theme.borderRadius.sm};
  color: ${theme.colors.textSecondary};
  text-align: center;
`

export default GasEstimateDisplay