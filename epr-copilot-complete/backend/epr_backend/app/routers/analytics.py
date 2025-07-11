from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Dict, Any, Optional
from ..database import get_db
from ..auth import get_current_user
from ..services.analytics_service import AnalyticsService

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


@router.get("/dashboard")
async def get_dashboard_analytics(
    period: str = Query("current", description="Time period for analytics (current, last_quarter, etc.)"),
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Get comprehensive analytics dashboard data.
    
    Returns all metrics needed for the analytics dashboard including:
    - Header metrics (Sustainability Score, Optimization Potential)
    - Overview metrics (Total EPR Fees, Active Products, etc.)
    - Cost analysis metrics
    - Projections metrics
    - Charts data
    """
    try:
        analytics_service = AnalyticsService(db)
        dashboard_data = analytics_service.get_dashboard_metrics(
            organization_id=current_user.organization_id,
            period=period
        )
        
        return {
            "success": True,
            "data": dashboard_data
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve dashboard analytics: {str(e)}"
        )


@router.get("/sustainability-score")
async def get_sustainability_score(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Get Sustainability Score calculation.
    
    Formula: Σ(Material Weight × Material Recyclability Percentage) / Total Weight
    """
    try:
        analytics_service = AnalyticsService(db)
        score = analytics_service._calculate_sustainability_score(current_user.organization_id)
        
        return {
            "success": True,
            "score": score,
            "status": "success",
            "explanation": "This score is a weighted average of the recyclability of the materials in all active products."
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to calculate sustainability score: {str(e)}"
        )


@router.get("/optimization-potential")
async def get_optimization_potential(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Get Optimization Potential calculation.
    
    Formula: Σ max(0, (Current Fee Rate - Alternative Fee Rate) × Weight)
    """
    try:
        analytics_service = AnalyticsService(db)
        
        has_sufficient_data = analytics_service._has_sufficient_historical_data(current_user.organization_id)
        
        if not has_sufficient_data:
            return {
                "success": True,
                "potential": None,
                "status": "insufficient_data",
                "message": "More data required. This metric will populate after 3 months of data is available.",
                "explanation": "This metric estimates your potential annual savings. We analyze each material you use and identify if a more cost-effective, recyclable alternative is available. The total represents the sum of all possible savings if you were to make these substitutions."
            }
        
        potential = analytics_service._calculate_optimization_potential(current_user.organization_id)
        
        return {
            "success": True,
            "potential": potential,
            "status": "success",
            "explanation": "This metric estimates your potential annual savings. We analyze each material you use and identify if a more cost-effective, recyclable alternative is available. The total represents the sum of all possible savings if you were to make these substitutions."
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to calculate optimization potential: {str(e)}"
        )


@router.get("/annual-fee-projection")
async def get_annual_fee_projection(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Get Annual Fee Projection calculation.
    
    Formula: (Σ(Fees over last 6 months)/6) × 12 × (1 + Projected Annual Growth Rate)
    """
    try:
        analytics_service = AnalyticsService(db)
        
        has_sufficient_data = analytics_service._has_sufficient_historical_data(current_user.organization_id)
        
        if not has_sufficient_data:
            return {
                "success": True,
                "annual_fee_projection": None,
                "status": "insufficient_data",
                "message": "More data required. This metric will populate after 3 months of data is available.",
                "explanation": "We project your annual fees by taking the average of your last 6 months of fees and then adjusting it based on your company's projected annual growth rate. This growth rate is calculated from your sales volume trends."
            }
        
        projection = analytics_service._calculate_annual_fee_projection(current_user.organization_id)
        
        return {
            "success": True,
            "annual_fee_projection": projection,
            "status": "calculated",
            "explanation": "We project your annual fees by taking the average of your last 6 months of fees and then adjusting it based on your company's projected annual growth rate. This growth rate is calculated from your sales volume trends."
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to calculate annual fee projection: {str(e)}"
        )


@router.get("/recyclability-savings")
async def get_recyclability_savings(
    target_improvement: float = Query(10.0, description="Target recyclability improvement percentage"),
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Get Recyclability Savings calculation.
    
    Models potential savings from achieving target improvement in recyclability rate.
    """
    try:
        analytics_service = AnalyticsService(db)
        
        has_sufficient_data = analytics_service._has_sufficient_historical_data(current_user.organization_id)
        
        if not has_sufficient_data:
            return {
                "success": True,
                "recyclability_savings": None,
                "status": "insufficient_data",
                "message": "More data required. This metric will populate after 3 months of data is available.",
                "explanation": "This figure estimates how much you could save on your projected annual fees by increasing your overall recyclability rate by a target percentage. It models the fee reductions you would receive for using more sustainable materials."
            }
        
        savings = analytics_service._calculate_recyclability_savings(current_user.organization_id)
        
        return {
            "success": True,
            "recyclability_savings": savings,
            "target_improvement": target_improvement,
            "status": "calculated",
            "explanation": "This figure estimates how much you could save on your projected annual fees by increasing your overall recyclability rate by a target percentage. It models the fee reductions you would receive for using more sustainable materials."
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to calculate recyclability savings: {str(e)}"
        )


@router.get("/fee-projections-chart")
async def get_fee_projections_chart(
    months: int = Query(6, description="Number of months to project"),
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Get Fee Projections Chart data using linear regression.
    
    Uses simple linear regression model to forecast fees for next 6 months.
    """
    try:
        analytics_service = AnalyticsService(db)
        
        has_sufficient_data = analytics_service._has_sufficient_historical_data(current_user.organization_id)
        
        if not has_sufficient_data:
            return {
                "success": True,
                "fee_projections": None,
                "status": "insufficient_data",
                "message": "More data required. This metric will populate after 3 months of data is available.",
                "explanation": "This chart forecasts your EPR fees for the next 6 months. It analyzes your fee payments over the past year to find a trend (using linear regression) and extends that trend into the future."
            }
        
        projections = analytics_service._calculate_fee_projections_chart(current_user.organization_id)
        
        return {
            "success": True,
            "fee_projections": projections,
            "months_projected": len(projections),
            "status": "calculated",
            "explanation": "This chart forecasts your EPR fees for the next 6 months. It analyzes your fee payments over the past year to find a trend (using linear regression) and extends that trend into the future."
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to calculate fee projections chart: {str(e)}"
        )


@router.get("/overview-metrics")
async def get_overview_metrics(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Get Overview tab metrics.
    
    Includes: Total EPR Fees, Active Products, Total Weight, Recyclability Rate
    """
    try:
        analytics_service = AnalyticsService(db)
        overview_data = analytics_service._calculate_overview_metrics(current_user.organization_id)
        
        return {
            "totalEprFees": overview_data["total_epr_fees"],
            "activeProducts": overview_data["active_products"],
            "totalWeight": overview_data["total_weight"],
            "recyclabilityRate": overview_data["recyclability_rate"]
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve overview metrics: {str(e)}"
        )


@router.get("/cost-analysis")
async def get_cost_analysis_metrics(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Get Cost Analysis tab metrics.
    
    Includes: Current Quarterly Fees, Potential Savings, Cost per Unit, Annual Fee Projection
    """
    try:
        analytics_service = AnalyticsService(db)
        has_sufficient_data = analytics_service._has_sufficient_historical_data(current_user.organization_id)
        cost_data = analytics_service._calculate_cost_analysis_metrics(
            current_user.organization_id, 
            has_sufficient_data
        )
        
        return {
            "success": True,
            "data": cost_data,
            "has_sufficient_data": has_sufficient_data
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve cost analysis metrics: {str(e)}"
        )


@router.get("/projections")
async def get_projections_metrics(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Get Projections tab metrics.
    
    Includes: Quarterly Growth, Annual Fees, Recyclability Savings
    """
    try:
        analytics_service = AnalyticsService(db)
        has_sufficient_data = analytics_service._has_sufficient_historical_data(current_user.organization_id)
        projections_data = analytics_service._calculate_projection_metrics(
            current_user.organization_id,
            has_sufficient_data
        )
        
        return {
            "success": True,
            "data": projections_data,
            "has_sufficient_data": has_sufficient_data
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve projections metrics: {str(e)}"
        )


@router.get("/charts")
async def get_charts_data(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Get all charts data for the analytics dashboard.
    
    Includes: Fee Projections, Material Breakdown, Fees Trend
    """
    try:
        analytics_service = AnalyticsService(db)
        has_sufficient_data = analytics_service._has_sufficient_historical_data(current_user.organization_id)
        charts_data = analytics_service._calculate_charts_data(
            current_user.organization_id,
            has_sufficient_data
        )
        
        return {
            "success": True,
            "data": charts_data,
            "has_sufficient_data": has_sufficient_data
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve charts data: {str(e)}"
        )


@router.get("/optimization-plan")
async def get_optimization_plan(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Get detailed optimization plan with actionable opportunities.
    
    Returns ranked list of cost optimization opportunities based on material substitution analysis.
    """
    try:
        analytics_service = AnalyticsService(db)
        
        has_sufficient_data = analytics_service._has_sufficient_historical_data(current_user.organization_id)
        
        if not has_sufficient_data:
            return {
                "success": True,
                "opportunities": [],
                "status": "insufficient_data",
                "message": "More data required. This analysis will be available after 3 months of data is collected.",
                "total_potential_savings": 0
            }
        
        opportunities = analytics_service._calculate_optimization_opportunities(current_user.organization_id)
        total_savings = sum(opp.get('potentialSaving', 0) for opp in opportunities)
        
        return {
            "success": True,
            "opportunities": opportunities,
            "status": "success",
            "total_potential_savings": total_savings,
            "message": f"Found {len(opportunities)} optimization opportunities with potential annual savings of ${total_savings:,.2f}"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate optimization plan: {str(e)}"
        )


@router.get("/risk-analysis")
async def get_risk_analysis(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Get compliance risk analysis report.
    
    Calculates compliance risk score based on material composition and regulatory factors.
    """
    try:
        analytics_service = AnalyticsService(db)
        
        has_sufficient_data = analytics_service._has_sufficient_historical_data(current_user.organization_id)
        
        if not has_sufficient_data:
            return {
                "success": True,
                "risk_score": 0,
                "risk_level": "Unknown",
                "status": "insufficient_data",
                "message": "More data required. Risk analysis will be available after 3 months of data is collected.",
                "risk_factors": []
            }
        
        risk_analysis = analytics_service._calculate_compliance_risk_analysis(current_user.organization_id)
        
        return {
            "success": True,
            "risk_score": risk_analysis["risk_score"],
            "risk_level": risk_analysis["risk_level"],
            "status": "success",
            "risk_factors": risk_analysis["risk_factors"],
            "recommendations": risk_analysis["recommendations"],
            "message": f"Compliance risk level: {risk_analysis['risk_level']} (Score: {risk_analysis['risk_score']}/100)"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate risk analysis: {str(e)}"
        )


@router.get("/growth-strategy")
async def get_growth_strategy(
    target_jurisdiction: str = Query("CA", description="Target jurisdiction for expansion analysis"),
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Get growth strategy analysis with market expansion costing.
    
    Provides predictive modeling for market expansion and EPR fee projections.
    """
    try:
        analytics_service = AnalyticsService(db)
        
        has_sufficient_data = analytics_service._has_sufficient_historical_data(current_user.organization_id)
        
        if not has_sufficient_data:
            return {
                "success": True,
                "expansion_cost": 0,
                "status": "insufficient_data",
                "message": "More data required. Growth strategy analysis will be available after 3 months of data is collected.",
                "scenarios": []
            }
        
        growth_analysis = analytics_service._calculate_growth_strategy_analysis(
            current_user.organization_id, 
            target_jurisdiction
        )
        
        return {
            "success": True,
            "expansion_cost": growth_analysis["expansion_cost"],
            "target_jurisdiction": target_jurisdiction,
            "status": "success",
            "scenarios": growth_analysis["scenarios"],
            "recommendations": growth_analysis["recommendations"],
            "message": f"Market expansion to {target_jurisdiction} estimated at ${growth_analysis['expansion_cost']:,.2f} annual EPR fees"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate growth strategy: {str(e)}"
        )


@router.get("/fee-optimization-goal")
async def get_fee_optimization_goal(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Get the current fee optimization goal for the organization.
    """
    try:
        analytics_service = AnalyticsService(db)
        goal = analytics_service._get_fee_optimization_goal(current_user.organization_id)
        
        return {
            "success": True,
            "goal": goal
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve fee optimization goal: {str(e)}"
        )


@router.post("/fee-optimization-goal")
async def set_fee_optimization_goal(
    goal_data: Dict[str, Any],
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Set or update the fee optimization goal for the organization.
    """
    try:
        analytics_service = AnalyticsService(db)
        result = analytics_service._set_fee_optimization_goal(
            current_user.organization_id, 
            goal_data
        )
        
        return {
            "success": True,
            "goal": result["goal"],
            "current_value": result["current_value"],
            "message": "Fee optimization goal saved successfully"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to save fee optimization goal: {str(e)}"
        )


@router.get("/compliance-score")
async def get_compliance_score(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Calculate comprehensive compliance score based on multiple factors.
    
    Factors include:
    - Recyclability rate (40% weight)
    - Fee optimization performance (30% weight)
    - Regulatory compliance factors (20% weight)
    - Sustainability metrics (10% weight)
    """
    try:
        analytics_service = AnalyticsService(db)
        
        has_sufficient_data = analytics_service._has_sufficient_historical_data(current_user.organization_id)
        
        if not has_sufficient_data:
            return {
                "success": True,
                "compliance_score": 0,
                "score_breakdown": {},
                "status": "insufficient_data",
                "message": "More data required. Compliance score will be available after 3 months of data is collected.",
                "recommendations": []
            }
        
        compliance_data = analytics_service._calculate_compliance_score(current_user.organization_id)
        
        return {
            "success": True,
            "compliance_score": compliance_data["overall_score"],
            "score_breakdown": compliance_data["breakdown"],
            "status": "calculated",
            "grade": compliance_data["grade"],
            "recommendations": compliance_data["recommendations"],
            "message": f"Overall compliance score: {compliance_data['overall_score']}/100 (Grade: {compliance_data['grade']})"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to calculate compliance score: {str(e)}"
        )
