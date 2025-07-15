import { describe, it, expect, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import contractReducer from '../../actions/slices/contractSlice';
import { loadStoredContracts } from '../../actions/thunks/contractThunks';

describe('Contract Startup Loading Integration Test', () => {
  let store: any;
  
  beforeEach(() => {
    // テスト用のストアを作成
    store = configureStore({
      reducer: {
        contract: contractReducer
      }
    });
  });

  describe('実際のcontracts.jsonファイルからの読み込み', () => {
    it('contracts.jsonからコントラクトを読み込んでReduxストアに保存する', async () => {
      // 初期状態を確認
      const initialState = store.getState().contract;
      expect(initialState.contracts).toHaveLength(0);
      
      // loadStoredContractsを実行
      await store.dispatch(loadStoredContracts());
      
      // 読み込み後の状態を確認
      const updatedState = store.getState().contract;
      
      // 最低1つのコントラクトが読み込まれることを確認
      expect(updatedState.contracts.length).toBeGreaterThanOrEqual(1);
      
      // 各コントラクトが正しいフォーマットを持つことを確認
      updatedState.contracts.forEach((contract: any) => {
        expect(contract).toHaveProperty('address');
        expect(contract).toHaveProperty('abi');
        expect(contract).toHaveProperty('network');
        expect(contract).toHaveProperty('type');
        expect(contract).toHaveProperty('name');
        expect(contract).toHaveProperty('symbol');
        expect(contract).toHaveProperty('id');
        expect(contract).toHaveProperty('deployedAt');
        expect(contract).toHaveProperty('transactionHash');
        expect(contract).toHaveProperty('owner');
        
        // 型が正しく変換されているか確認
        expect(['erc20', 'erc721']).toContain(contract.type);
        expect(typeof contract.address).toBe('string');
        expect(typeof contract.name).toBe('string');
        expect(typeof contract.symbol).toBe('string');
        expect(Array.isArray(contract.abi)).toBe(true);
      });
    });

    it('My Second Tokenが読み込まれる', async () => {
      // loadStoredContractsを実行
      await store.dispatch(loadStoredContracts());
      
      const state = store.getState().contract;
      
      // My Second Tokenが読み込まれているか確認
      const mySecondToken = state.contracts.find((c: any) => c.name === 'My Second Token');
      
      expect(mySecondToken).toBeDefined();
      expect(mySecondToken.symbol).toBe('MST');
      expect(mySecondToken.type).toBe('erc20');
      expect(mySecondToken.address).toBe('0xaf0b1eA2be2183e633BfAD72F05A1E7e1e44a74f');
      expect(mySecondToken.network).toBe('sepolia');
      expect(mySecondToken.owner).toBe('0x0eA1b1C4260DF8b76087011905955e869220e11D');
      expect(mySecondToken.id).toBe('ERC20_My Second Token_1752382464454');
    });

    it('コントラクトタイプが正しく変換される', async () => {
      // loadStoredContractsを実行
      await store.dispatch(loadStoredContracts());
      
      const state = store.getState().contract;
      
      // すべてのコントラクトが正しいタイプを持つことを確認
      const erc20Contracts = state.contracts.filter((c: any) => c.type === 'erc20');
      const erc721Contracts = state.contracts.filter((c: any) => c.type === 'erc721');
      
      // 少なくとも1つのERC20コントラクトが存在することを確認
      expect(erc20Contracts.length).toBeGreaterThanOrEqual(1);
      
      // My Second TokenがERC20として正しく分類されることを確認
      const mySecondToken = erc20Contracts.find((c: any) => c.name === 'My Second Token');
      expect(mySecondToken).toBeDefined();
      expect(mySecondToken.type).toBe('erc20'); // 'ERC20' -> 'erc20'に変換されている
    });

    it('コントラクトデータの一貫性が保たれる', async () => {
      // loadStoredContractsを実行
      await store.dispatch(loadStoredContracts());
      
      const state = store.getState().contract;
      
      // 各コントラクトに必要なフィールドが存在することを確認
      state.contracts.forEach((contract: any) => {
        expect(contract.address).toBeTruthy();
        expect(contract.name).toBeTruthy();
        expect(contract.symbol).toBeTruthy();
        expect(contract.type).toBeTruthy();
        expect(contract.network).toBeTruthy();
        expect(contract.deployedAt).toBeTruthy();
        expect(contract.id).toBeTruthy();
        
        // アドレスが正しいフォーマットであることを確認
        expect(contract.address).toMatch(/^0x[a-fA-F0-9]{40}$/);
        
        // 日付が正しいフォーマットであることを確認
        expect(new Date(contract.deployedAt).toISOString()).toBe(contract.deployedAt);
      });
    });

    it('ABIデータが正しく読み込まれる', async () => {
      // loadStoredContractsを実行
      await store.dispatch(loadStoredContracts());
      
      const state = store.getState().contract;
      
      // My Second TokenのABIが正しく読み込まれることを確認
      const mySecondToken = state.contracts.find((c: any) => c.name === 'My Second Token');
      expect(mySecondToken).toBeDefined();
      expect(Array.isArray(mySecondToken.abi)).toBe(true);
      expect(mySecondToken.abi.length).toBeGreaterThan(0);
      
      // ABI内にERC20の標準的な関数が含まれていることを確認
      const abiFunctions = mySecondToken.abi.filter((item: any) => item.type === 'function');
      const functionNames = abiFunctions.map((fn: any) => fn.name);
      
      expect(functionNames).toContain('name');
      expect(functionNames).toContain('symbol');
      expect(functionNames).toContain('totalSupply');
      expect(functionNames).toContain('balanceOf');
      expect(functionNames).toContain('transfer');
    });
  });
});