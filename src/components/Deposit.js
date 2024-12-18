import Card from 'react-bootstrap/Card';
import { useSelector } from 'react-redux';

const Deposit = () => {
    const account = useSelector(state => state.provider.account);
    return (
        <div>
            <Card style={{ width: '450px' }} className="mx-auto px-4">
                {account ? (
                    <div>Deposit</div>
                ) : (
                    <p
                    className='d-flex justify-content-center align-items-center'
                    style={{ height: '300px' }}
                    >
                        Please connect your wallet.
                    </p>
                )}
            </Card>
        </div>
    )
}  

export default Deposit;