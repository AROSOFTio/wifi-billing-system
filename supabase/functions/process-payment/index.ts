import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { paymentMethod, planId, phoneNumber, amount, deviceId } = await req.json()

    if (!deviceId) {
      throw new Error('Device ID is required')
    }

    console.log(`Processing payment for device ${deviceId}, plan ${planId}, method ${paymentMethod}`)

    // Create payment record (use device ID as user reference for now)
    const { data: payment, error: paymentError } = await supabase
      .from('device_payments')
      .insert({
        device_id: deviceId,
        amount: amount,
        payment_method: paymentMethod,
        status: 'pending',
        metadata: {
          phone_number: phoneNumber,
          plan_id: planId
        }
      })
      .select()
      .single()

    if (paymentError) {
      throw paymentError
    }

    // Process payment based on method
    let paymentResult
    switch (paymentMethod) {
      case 'mtn':
        paymentResult = await processMTNPayment(phoneNumber, amount, payment.id)
        break
      case 'airtel':
        paymentResult = await processAirtelPayment(phoneNumber, amount, payment.id)
        break
      case 'visa':
      case 'wallet':
        // For demo purposes, simulate success
        paymentResult = { success: true, reference: `demo_${Date.now()}` }
        break
      default:
        throw new Error('Unsupported payment method')
    }

    if (paymentResult.success) {
      // Update payment status
      await supabase
        .from('device_payments')
        .update({
          status: 'completed',
          payment_reference: paymentResult.reference
        })
        .eq('id', payment.id)

      // Get plan details
      const { data: plan } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('id', planId)
        .single()

      if (plan) {
        // Create or update device subscription
        const expiresAt = new Date(Date.now() + plan.duration_hours * 60 * 60 * 1000)
        
        await supabase
          .from('device_subscriptions')
          .insert({
            device_id: deviceId,
            plan_id: planId,
            status: 'active',
            starts_at: new Date().toISOString(),
            expires_at: expiresAt.toISOString()
          })

        // TODO: Connect to Mikrotik router to activate device
        console.log(`Activating device ${deviceId} on Mikrotik router until ${expiresAt}`)
      }

      return new Response(
        JSON.stringify({ success: true, payment_id: payment.id }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } else {
      // Update payment status to failed
      await supabase
        .from('device_payments')
        .update({ status: 'failed' })
        .eq('id', payment.id)

      throw new Error('Payment failed')
    }

  } catch (error) {
    console.error('Payment processing error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

async function processMTNPayment(phoneNumber: string, amount: number, paymentId: string) {
  // TODO: Integrate with MTN Mobile Money API
  console.log(`Processing MTN payment: ${phoneNumber}, ${amount}, ${paymentId}`)
  
  // For demo purposes, simulate success
  return {
    success: true,
    reference: `mtn_${Date.now()}`
  }
}

async function processAirtelPayment(phoneNumber: string, amount: number, paymentId: string) {
  // TODO: Integrate with Airtel Money API
  console.log(`Processing Airtel payment: ${phoneNumber}, ${amount}, ${paymentId}`)
  
  // For demo purposes, simulate success
  return {
    success: true,
    reference: `airtel_${Date.now()}`
  }
}