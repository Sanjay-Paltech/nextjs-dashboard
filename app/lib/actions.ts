'use server';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {z} from 'zod';
import { User } from './definitions';
import { signIn } from '../../auth';
import { AuthError } from 'next-auth';

const FormSchema = z.object({
    id: z.string(),
    customer_id: z.string({
        invalid_type_error : 'Please select a customer.'
    }),
    amount: z.coerce.number().gt(0,{message : 'Please enter an amount grater than $0.'}),
    status: z.enum(['pending','paid'],{
        invalid_type_error : 'Please select an invoice status'
    }),
    date: z.string(),
})

export type State = {
    errors?: {
        customerId?: string[];
        amount?: string[];
        status?: string[];
    };
    message?: string | null;
}

const CreateInvoice = FormSchema.omit({id:true, date:true});
const UpdateInvoice = FormSchema.omit({id:true, date:true});

export async function createInvoice(prevState : State,formData : FormData) {
    const validatedFeilds = CreateInvoice.safeParse({
        customer_id: formData.get('customer_id'),
        amount:  formData.get('amount'),
        status: formData.get('status')
    });

    if(!validatedFeilds.success){
        console.log('In createInvoice data function',validatedFeilds.error);
        return {
            errors: validatedFeilds.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Create Invoice'
        };
    }

    const {customer_id,amount,status} = validatedFeilds.data
    
    const amountCents = amount*100;
    const date = new Date().toISOString().split('T')[0];
    try{
        await sql`
            INSERT INTO invoices (customer_id,amount,status,date)
            VALUES (${customer_id}, ${amountCents}, ${status}, ${date})
            `;
        }
    catch(err){
        console.log(err);
        return {
            message: 'Database Error: Failed to Create Invoice'+ err
        }

    }
    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
}

export async function updateInvoice(id : string, prevState: State, formData: FormData) {
    const validatedFeilds = UpdateInvoice.safeParse({
        customer_id: formData.get('customer_id'),
        amount:  formData.get('amount'),
        status: formData.get('status')
    });

    if(!validatedFeilds.success){
        return {
            errors : validatedFeilds.error.flatten().fieldErrors,
            message: 'This form has missing fields'
        };
    }

    const {customer_id,amount,status} = validatedFeilds.data

    const amountCents = amount*100;
    try{
        await sql`
            UPDATE invoices SET
                customer_id = ${customer_id}
                amount = ${amountCents}, 
                status = ${status}
            WHERE id = ${id}
            `;
        }
    catch(err){
        console.log(err);
        return 'Database Error: Failed to update invoice'+ err;
    }
    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string) {
    // return new Error();
    try{
        await sql`DELETE FROM invoices WHERE id = ${id};`
    }
    catch(err){
        console.log(err);
        return err;
    }
    revalidatePath('dashboard/invoices');
}

export async function authenticate(
    prevState : string | undefined,
    formData : FormData
) {
    try{
        await signIn('credentials',formData);
    }
    catch(error){
        if(error instanceof AuthError)  {
            switch(error.type){
                case 'CredentialsSignin': return 'Invalid Credentials';
                default: return 'Something went wrong';
            }
        }
        throw error;
    }
}