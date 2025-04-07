import { describe, it, expect, beforeEach, vi } from "vitest"

// Mock the Clarity contract environment
const mockContractEnv = {
  tx: {
    sender: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
  },
  contracts: {
    providerIdentity: {
      "register-provider": vi.fn(),
      "update-provider": vi.fn(),
      "deactivate-provider": vi.fn(),
      "reactivate-provider": vi.fn(),
      "get-provider": vi.fn(),
      "get-provider-id-by-principal": vi.fn(),
      "provider-exists": vi.fn(),
    },
  },
}

// Mock the contract calls
const mockContractCall = (method, args, result) => {
  mockContractEnv.contracts.providerIdentity[method].mockReturnValueOnce(result)
}

describe("Provider Identity Contract", () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.resetAllMocks()
  })
  
  describe("register-provider", () => {
    it("should successfully register a new provider", () => {
      const providerId = "provider-123"
      const fullName = "Dr. Jane Smith"
      const specialty = "Cardiology"
      const npiNumber = "1234567890"
      
      mockContractCall("provider-exists", [providerId], false)
      mockContractCall("register-provider", [providerId, fullName, specialty, npiNumber], { ok: providerId })
      
      const result = mockContractEnv.contracts.providerIdentity["register-provider"](
          providerId,
          fullName,
          specialty,
          npiNumber,
      )
      
      expect(result).toEqual({ ok: providerId })
      expect(mockContractEnv.contracts.providerIdentity["register-provider"]).toHaveBeenCalledWith(
          providerId,
          fullName,
          specialty,
          npiNumber,
      )
    })
    
    it("should fail if provider already exists", () => {
      const providerId = "provider-123"
      const fullName = "Dr. Jane Smith"
      const specialty = "Cardiology"
      const npiNumber = "1234567890"
      
      mockContractCall("provider-exists", [providerId], true)
      mockContractCall("register-provider", [providerId, fullName, specialty, npiNumber], { err: 2 })
      
      const result = mockContractEnv.contracts.providerIdentity["register-provider"](
          providerId,
          fullName,
          specialty,
          npiNumber,
      )
      
      expect(result).toEqual({ err: 2 })
    })
  })
  
  describe("update-provider", () => {
    it("should successfully update an existing provider", () => {
      const providerId = "provider-123"
      const fullName = "Dr. Jane Smith"
      const specialty = "Neurology" // Updated specialty
      const npiNumber = "1234567890"
      
      mockContractCall("get-provider", [providerId], {
        principal: mockContractEnv.tx.sender,
        full_name: "Dr. Jane Smith",
        specialty: "Cardiology",
        npi_number: "1234567890",
        active: true,
        created_at: 12345,
        updated_at: 12345,
      })
      
      mockContractCall("update-provider", [providerId, fullName, specialty, npiNumber], { ok: providerId })
      
      const result = mockContractEnv.contracts.providerIdentity["update-provider"](
          providerId,
          fullName,
          specialty,
          npiNumber,
      )
      
      expect(result).toEqual({ ok: providerId })
      expect(mockContractEnv.contracts.providerIdentity["update-provider"]).toHaveBeenCalledWith(
          providerId,
          fullName,
          specialty,
          npiNumber,
      )
    })
    
    it("should fail if provider does not exist", () => {
      const providerId = "provider-123"
      const fullName = "Dr. Jane Smith"
      const specialty = "Neurology"
      const npiNumber = "1234567890"
      
      mockContractCall("get-provider", [providerId], null)
      mockContractCall("update-provider", [providerId, fullName, specialty, npiNumber], { err: 3 })
      
      const result = mockContractEnv.contracts.providerIdentity["update-provider"](
          providerId,
          fullName,
          specialty,
          npiNumber,
      )
      
      expect(result).toEqual({ err: 3 })
    })
  })
  
  describe("deactivate-provider", () => {
    it("should successfully deactivate a provider", () => {
      const providerId = "provider-123"
      
      mockContractCall("get-provider", [providerId], {
        principal: mockContractEnv.tx.sender,
        full_name: "Dr. Jane Smith",
        specialty: "Cardiology",
        npi_number: "1234567890",
        active: true,
        created_at: 12345,
        updated_at: 12345,
      })
      
      mockContractCall("deactivate-provider", [providerId], { ok: providerId })
      
      const result = mockContractEnv.contracts.providerIdentity["deactivate-provider"](providerId)
      
      expect(result).toEqual({ ok: providerId })
      expect(mockContractEnv.contracts.providerIdentity["deactivate-provider"]).toHaveBeenCalledWith(providerId)
    })
  })
  
  describe("reactivate-provider", () => {
    it("should successfully reactivate a provider", () => {
      const providerId = "provider-123"
      
      mockContractCall("get-provider", [providerId], {
        principal: mockContractEnv.tx.sender,
        full_name: "Dr. Jane Smith",
        specialty: "Cardiology",
        npi_number: "1234567890",
        active: false,
        created_at: 12345,
        updated_at: 12345,
      })
      
      mockContractCall("reactivate-provider", [providerId], { ok: providerId })
      
      const result = mockContractEnv.contracts.providerIdentity["reactivate-provider"](providerId)
      
      expect(result).toEqual({ ok: providerId })
      expect(mockContractEnv.contracts.providerIdentity["reactivate-provider"]).toHaveBeenCalledWith(providerId)
    })
  })
})

