import React, { useEffect, useState } from 'react';
import ClientLayout from '../../layout/clientLayout';
import ConnectedClientLayout from '../../layout/ConnectedClientLayout';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { format, differenceInMonths, differenceInDays, differenceInHours, differenceInMinutes, differenceInSeconds } from 'date-fns';


const SubmissionDetails: React.FC = () => {
    const [submissionDetails, setSubmissionDetails] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<string>('overview'); // Default active tab
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCompany, setSelectedCompany] = useState<any>(null);

    
    const { id } = useParams();

    const fetchSubmissionDetails = async () => {
        try {
            const response = await axios.get(`http://localhost:3000/submission/${id}`);
            setSubmissionDetails(response.data);

        } catch (error) {
            console.error('Error fetching submission details:', error);
        }
    };

    useEffect(() => {
        fetchSubmissionDetails();
    }, [id]);

    if (!submissionDetails) {
        return <div>Loading...</div>;
    }

    const getStatusColor = () => {
        switch (submissionDetails.status) {
            case 'approved':
                return 'bg-green-500';
            case 'pending':
                return 'bg-red-500';
            default:
                return 'bg-gray-500';
        }
    };

    const getStatusText = () => {
        switch (submissionDetails.status) {
            case 'approved':
                return 'Approved';
            case 'pending':
                return 'Pending';
            default:
                return 'Unknown';
        }
    };



   

    return (
        <ConnectedClientLayout>
        <div className="container mx-auto px-4 py-8">
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="p-4">
                    <div className="flex items-center">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 mt-2">{submissionDetails.description}</h2>
                            <div className="flex items-center mt-4">
                                <div className={`rounded-full py-1 px-3 text-sm font-semibold mr-4 ${getStatusColor()}`}>
                                    {getStatusText()}
                                </div>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 fill-current text-gray-500 mr-2" viewBox="0 0 24 24">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-12h2v6h-2zm0 8h2v2h-2z" />
                                </svg>
                                <p className="text-gray-600">
    Submitted on: {submissionDetails.submissionDate ? format(new Date(submissionDetails.submissionDate), 'MM/dd/yyyy') : 'N/A'}
</p>
                            </div>
                            <p className="text-black font-bold cursor-pointer">
    Submitted by: {submissionDetails.submittedBy ? submissionDetails.submittedBy.FirstName : 'Unknown'}
</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </ConnectedClientLayout>
    );
};

export default SubmissionDetails;
