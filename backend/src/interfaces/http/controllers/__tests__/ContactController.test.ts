import { Request, Response } from 'express';
import { ContactController } from '../ContactController';
import { IContactService } from '../../../../application/ports/IContactService';
import {
  ContactResponseDTO,
  ContactListResponseDTO,
} from '../../../../application/dtos/contacts.dto';

describe('ContactController', () => {
  let mockContactService: jest.Mocked<IContactService>;
  let contactController: ContactController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;
  let mockSend: jest.Mock;

  beforeEach(() => {
    mockContactService = {
      createContact: jest.fn(),
      getContactsByUser: jest.fn(),
      updateContact: jest.fn(),
      deleteContact: jest.fn(),
      searchContacts: jest.fn(),
      getContactByIdAndValidateUser: jest.fn(),
    } as jest.Mocked<IContactService>;

    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnThis();
    mockSend = jest.fn();

    mockResponse = {
      json: mockJson,
      status: mockStatus,
      send: mockSend,
    };

    contactController = new ContactController(mockContactService);
  });

  describe('createContact', () => {
    it('should create a contact successfully', async () => {
      const contactData = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '1234567890',
      };

      mockRequest = {
        body: contactData,
        user: { id: 'user-123' },
      };

      const mockContact: ContactResponseDTO = {
        id: 'contact-123',
        ...contactData,
        userId: 'user-123',
      };

      mockContactService.createContact.mockResolvedValue(mockContact);

      await contactController.createContact(mockRequest as Request, mockResponse as Response);

      expect(mockContactService.createContact).toHaveBeenCalledWith({
        ...contactData,
        userId: 'user-123',
      });
      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith(mockContact);
    });

    it('should handle validation errors during creation', async () => {
      mockRequest = {
        body: {},
        user: { id: 'user-123' },
      };

      const error = new Error('Validation failed');
      mockContactService.createContact.mockRejectedValue(error);

      await contactController.createContact(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({ message: error.message });
    });

    it('should handle missing user in request', async () => {
      mockRequest = {
        body: {},
      };

      await contactController.createContact(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({ message: 'User not found' });
    });

    it('should handle non-Error exceptions during creation', async () => {
      mockRequest = {
        body: {},
        user: { id: 'user-123' },
      };

      mockContactService.createContact.mockRejectedValue('Unknown error');

      await contactController.createContact(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({ message: 'Internal server error' });
    });
  });

  describe('getContacts', () => {
    it('should get contacts successfully', async () => {
      const mockContacts: ContactListResponseDTO = {
        items: [
          {
            id: 'contact-123',
            name: 'John Doe',
            email: 'john@example.com',
            phone: '1234567890',
            userId: 'user-123',
          },
        ],
        total: 1,
        page: 1,
        limit: 10,
      };

      mockRequest = {
        user: { id: 'user-123' },
        query: { page: '1', limit: '10' },
      };

      mockContactService.getContactsByUser.mockResolvedValue(mockContacts);

      await contactController.getContacts(mockRequest as Request, mockResponse as Response);

      expect(mockContactService.getContactsByUser).toHaveBeenCalledWith('user-123', {
        userId: 'user-123',
        page: 1,
        limit: 10,
        query: undefined,
      });
      expect(mockJson).toHaveBeenCalledWith(mockContacts);
    });

    it('should handle invalid pagination parameters', async () => {
      mockRequest = {
        user: { id: 'user-123' },
        query: { page: 'invalid', limit: 'invalid' },
      };

      await contactController.getContacts(mockRequest as Request, mockResponse as Response);

      expect(mockContactService.getContactsByUser).toHaveBeenCalledWith('user-123', {
        userId: 'user-123',
        page: 1,
        limit: 10,
        query: undefined,
      });
    });

    it('should handle service errors during retrieval', async () => {
      mockRequest = {
        user: { id: 'user-123' },
        query: {},
      };

      const error = new Error('Retrieval failed');
      mockContactService.getContactsByUser.mockRejectedValue(error);

      await contactController.getContacts(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({ message: 'Internal server error' });
    });

    it('should handle missing user in request', async () => {
      mockRequest = {
        query: {},
      };

      await contactController.getContacts(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({ message: 'User not found' });
    });
  });

  describe('getContact', () => {
    it('should return 400 if user is not found', async () => {
      mockRequest = {
        user: undefined,
        params: { contactId: '123' },
      };

      await contactController.getContact(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({ message: 'User not found' });
    });

    it('should return contact when found', async () => {
      const mockContact: ContactResponseDTO = {
        id: '123',
        userId: '456',
        name: 'Test Contact',
        email: 'test@example.com',
        phone: '1234567890',
      };

      mockRequest = {
        user: { id: '456' },
        params: { contactId: '123' },
      };

      mockContactService.getContactByIdAndValidateUser.mockResolvedValue(mockContact);

      await contactController.getContact(mockRequest as Request, mockResponse as Response);

      expect(mockContactService.getContactByIdAndValidateUser).toHaveBeenCalledWith('123', '456');
      expect(mockJson).toHaveBeenCalledWith(mockContact);
    });

    it('should return 404 when contact is not found', async () => {
      mockRequest = {
        user: { id: '456' },
        params: { contactId: '123' },
      };

      mockContactService.getContactByIdAndValidateUser.mockRejectedValue(
        new Error('Contact not found'),
      );

      await contactController.getContact(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({ message: 'Contact not found' });
    });

    it('should return 500 on unexpected error', async () => {
      mockRequest = {
        user: { id: '456' },
        params: { contactId: '123' },
      };

      mockContactService.getContactByIdAndValidateUser.mockRejectedValue(
        new Error('Unexpected error'),
      );

      await contactController.getContact(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({ message: 'Internal server error' });
    });
  });

  describe('updateContact', () => {
    it('should update contact successfully', async () => {
      const contactData = {
        name: 'Updated Name',
        email: 'updated@example.com',
      };

      mockRequest = {
        params: { contactId: 'contact-123' },
        body: contactData,
        user: { id: 'user-123' },
      };

      const mockUpdatedContact: ContactResponseDTO = {
        id: 'contact-123',
        ...contactData,
        phone: '1234567890',
        userId: 'user-123',
      };

      mockContactService.updateContact.mockResolvedValue(mockUpdatedContact);

      await contactController.updateContact(mockRequest as Request, mockResponse as Response);

      expect(mockContactService.updateContact).toHaveBeenCalledWith(
        'contact-123',
        'user-123',
        contactData,
      );
      expect(mockJson).toHaveBeenCalledWith(mockUpdatedContact);
    });

    it('should handle contact not found during update', async () => {
      mockRequest = {
        params: { contactId: 'non-existent' },
        body: {},
        user: { id: 'user-123' },
      };

      mockContactService.updateContact.mockRejectedValue(new Error('Contact not found'));

      await contactController.updateContact(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({ message: 'Contact not found' });
    });

    it('should handle missing user in request', async () => {
      mockRequest = {
        params: { contactId: 'contact-123' },
        body: {},
      };

      await contactController.updateContact(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({ message: 'User not found' });
    });

    it('should handle non-Error exceptions during update', async () => {
      mockRequest = {
        params: { contactId: 'contact-123' },
        body: {},
        user: { id: 'user-123' },
      };

      mockContactService.updateContact.mockRejectedValue('Unknown error');

      await contactController.updateContact(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({ message: 'Internal server error' });
    });
  });

  describe('deleteContact', () => {
    it('should delete contact successfully', async () => {
      mockRequest = {
        params: { contactId: 'contact-123' },
        user: { id: 'user-123' },
      };

      mockContactService.deleteContact.mockResolvedValue(undefined);

      await contactController.deleteContact(mockRequest as Request, mockResponse as Response);

      expect(mockContactService.deleteContact).toHaveBeenCalledWith('contact-123', 'user-123');
      expect(mockStatus).toHaveBeenCalledWith(204);
      expect(mockSend).toHaveBeenCalled();
    });

    it('should handle contact not found during deletion', async () => {
      mockRequest = {
        params: { contactId: 'non-existent' },
        user: { id: 'user-123' },
      };

      mockContactService.deleteContact.mockRejectedValue(new Error('Contact not found'));

      await contactController.deleteContact(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({ message: 'Contact not found' });
    });

    it('should handle missing user in request', async () => {
      mockRequest = {
        params: { contactId: 'contact-123' },
      };

      await contactController.deleteContact(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({ message: 'User not found' });
    });

    it('should handle non-Error exceptions during deletion', async () => {
      mockRequest = {
        params: { contactId: 'contact-123' },
        user: { id: 'user-123' },
      };

      mockContactService.deleteContact.mockRejectedValue('Unknown error');

      await contactController.deleteContact(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({ message: 'Internal server error' });
    });
  });
});
