package com.example.auth.dto;

public class ParticipantRegistrationRequest {
    
    private String notes;
    
    private String emergencyContact;
    
    private String emergencyPhone;
    
    // 构造函数
    public ParticipantRegistrationRequest() {}
    
    // Getters and Setters
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    
    public String getEmergencyContact() { return emergencyContact; }
    public void setEmergencyContact(String emergencyContact) { this.emergencyContact = emergencyContact; }
    
    public String getEmergencyPhone() { return emergencyPhone; }
    public void setEmergencyPhone(String emergencyPhone) { this.emergencyPhone = emergencyPhone; }
}
